/**
 * Human main module
 */

import { log, now, mergeDeep } from './helpers';
import { Config, defaults } from './config';
import type { Result, FaceResult, HandResult, BodyResult, ObjectResult, GestureResult, PersonResult } from './result';
import * as tf from '../dist/tfjs.esm.js';
import * as models from './models';
import * as face from './face';
import * as facemesh from './blazeface/facemesh';
import * as faceres from './faceres/faceres';
import * as posenet from './posenet/posenet';
import * as handpose from './handpose/handpose';
import * as blazepose from './blazepose/blazepose';
import * as efficientpose from './efficientpose/efficientpose';
import * as movenet from './movenet/movenet';
import * as nanodet from './object/nanodet';
import * as centernet from './object/centernet';
import * as segmentation from './segmentation/segmentation';
import * as gesture from './gesture/gesture';
import * as image from './image/image';
import * as draw from './draw';
import * as persons from './persons';
import * as interpolate from './interpolate';
import * as env from './env';
import * as backend from './tfjs/backend';
import * as humangl from './tfjs/humangl';
import * as app from '../package.json';
import * as warmups from './warmup';
import type { Tensor, GraphModel } from './tfjs/types';
import type { DrawOptions } from './draw';

// export types
export * from './config';
export * from './result';
export type { DrawOptions } from './draw';
export { env } from './env';

/** Defines all possible input types for **Human** detection
 * @typedef Input Type
 */
export type Input = Tensor | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;

/** Events dispatched by `human.events`
 *
 * - `create`: triggered when Human object is instantiated
 * - `load`: triggered when models are loaded (explicitly or on-demand)
 * - `image`: triggered when input image is this.processed
 * - `result`: triggered when detection is complete
 * - `warmup`: triggered when warmup is complete
 */
export type Events = 'create' | 'load' | 'image' | 'result' | 'warmup' | 'error';

/** Error message
 * @typedef Error Type
 */
export type Error = { error: string };

/** Instance of TensorFlow/JS
 * @external
 */
export type TensorFlow = typeof tf;

/** **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 *
 * @param userConfig: {@link Config}
 * @return instance
 */
export class Human {
  /** Current version of Human library in *semver* format */
  version: string;

  /** Current configuration
   * - Details: {@link Config}
   */
  config: Config;

  /** Last known result of detect run
   * - Can be accessed anytime after initial detection
   */
  result: Result;

  /** Current state of Human library
   * - Can be polled to determine operations that are currently executed
   * - Progresses through: 'config', 'check', 'backend', 'load', 'run:<model>', 'idle'
   */
  state: string;

  /** currenty processed image tensor and canvas */
  process: { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement | null };

  /** Instance of TensorFlow/JS used by Human
   *  - Can be embedded or externally provided
   * @internal
   */
  tf: TensorFlow;

  /** Object containing environment information used for diagnostics */
  env: env.Env;

  /** Draw helper classes that can draw detected objects on canvas using specified draw
   * - options: {@link DrawOptions} global settings for all draw operations, can be overriden for each draw method
   * - face: draw detected faces
   * - body: draw detected people and body parts
   * - hand: draw detected hands and hand parts
   * - canvas: draw this.processed canvas which is a this.processed copy of the input
   * - all: meta-function that performs: canvas, face, body, hand
   */
  draw: { canvas, face, body, hand, gesture, object, person, all, options: DrawOptions };

  /** Currently loaded models
   * @internal
  */
  models: {
    face: [unknown, GraphModel | null, GraphModel | null] | null,
    posenet: GraphModel | null,
    blazepose: GraphModel | null,
    efficientpose: GraphModel | null,
    movenet: GraphModel | null,
    handpose: [GraphModel | null, GraphModel | null] | null,
    age: GraphModel | null,
    gender: GraphModel | null,
    emotion: GraphModel | null,
    embedding: GraphModel | null,
    nanodet: GraphModel | null,
    centernet: GraphModel | null,
    faceres: GraphModel | null,
    segmentation: GraphModel | null,
  };

  /** Container for events dispatched by Human
   *
   * Possible events:
   * - `create`: triggered when Human object is instantiated
   * - `load`: triggered when models are loaded (explicitly or on-demand)
   * - `image`: triggered when input image is this.processed
   * - `result`: triggered when detection is complete
   * - `warmup`: triggered when warmup is complete
   * - `error`: triggered on some errors
   */
  events: EventTarget;
  /** Reference face triangualtion array of 468 points, used for triangle references between points */
  faceTriangulation: typeof facemesh.triangulation;
  /** Refernce UV map of 468 values, used for 3D mapping of the face mesh */
  faceUVMap: typeof facemesh.uvmap;
  /** Performance object that contains values for all recently performed operations */
  performance: Record<string, number>; // perf members are dynamically defined as needed
  #numTensors: number;
  #analyzeMemoryLeaks: boolean;
  #checkSanity: boolean;
  /** WebGL debug info */
  gl: Record<string, unknown>;
  // definition end

  /** Constructor for **Human** library that is futher used for all operations
   *
   * @param userConfig: {@link Config}
   *
   * @return instance
   */
  constructor(userConfig?: Partial<Config>) {
    env.get();
    this.env = env.env;
    defaults.wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tf.version_core}/dist/`;
    defaults.modelBasePath = this.env.browser ? '../models/' : 'file://models/';
    defaults.backend = this.env.browser ? 'humangl' : 'tensorflow';
    this.version = app.version; // expose version property on instance of class
    Object.defineProperty(this, 'version', { value: app.version }); // expose version property directly on class itself
    this.config = mergeDeep(defaults, userConfig || {});
    this.tf = tf;
    this.state = 'idle';
    this.#numTensors = 0;
    this.#analyzeMemoryLeaks = false;
    this.#checkSanity = false;
    this.performance = { backend: 0, load: 0, image: 0, frames: 0, cached: 0, changed: 0, total: 0, draw: 0 };
    this.events = new EventTarget();
    // object that contains all initialized models
    this.models = {
      face: null, // array of models
      handpose: null, // array of models
      posenet: null,
      blazepose: null,
      efficientpose: null,
      movenet: null,
      age: null,
      gender: null,
      emotion: null,
      embedding: null,
      nanodet: null,
      centernet: null,
      faceres: null,
      segmentation: null,
    };
    // reexport draw methods
    this.draw = {
      options: draw.options as DrawOptions,
      canvas: (input: HTMLCanvasElement | OffscreenCanvas | HTMLImageElement | HTMLMediaElement | HTMLVideoElement, output: HTMLCanvasElement) => draw.canvas(input, output),
      face: (output: HTMLCanvasElement | OffscreenCanvas, result: FaceResult[], options?: Partial<DrawOptions>) => draw.face(output, result, options),
      body: (output: HTMLCanvasElement | OffscreenCanvas, result: BodyResult[], options?: Partial<DrawOptions>) => draw.body(output, result, options),
      hand: (output: HTMLCanvasElement | OffscreenCanvas, result: HandResult[], options?: Partial<DrawOptions>) => draw.hand(output, result, options),
      gesture: (output: HTMLCanvasElement | OffscreenCanvas, result: GestureResult[], options?: Partial<DrawOptions>) => draw.gesture(output, result, options),
      object: (output: HTMLCanvasElement | OffscreenCanvas, result: ObjectResult[], options?: Partial<DrawOptions>) => draw.object(output, result, options),
      person: (output: HTMLCanvasElement | OffscreenCanvas, result: PersonResult[], options?: Partial<DrawOptions>) => draw.person(output, result, options),
      all: (output: HTMLCanvasElement | OffscreenCanvas, result: Result, options?: Partial<DrawOptions>) => draw.all(output, result, options),
    };
    this.result = { face: [], body: [], hand: [], gesture: [], object: [], performance: {}, timestamp: 0, persons: [] };
    // export access to image this.processing
    // @ts-ignore eslint-typescript cannot correctly infer type in anonymous function
    this.process = { tensor: null, canvas: null };
    // export raw access to underlying models
    this.faceTriangulation = facemesh.triangulation;
    this.faceUVMap = facemesh.uvmap;
    // set gl info
    this.gl = humangl.config;
    // include platform info
    this.emit('create');
  }

  // helper function: measure tensor leak
  /** @hidden */
  analyze = (...msg: string[]) => {
    if (!this.#analyzeMemoryLeaks) return;
    const currentTensors = this.tf.engine().state.numTensors;
    const previousTensors = this.#numTensors;
    this.#numTensors = currentTensors;
    const leaked = currentTensors - previousTensors;
    if (leaked !== 0) log(...msg, leaked);
  }

  // quick sanity check on inputs
  /** @hidden */
  #sanity = (input: Input): null | string => {
    if (!this.#checkSanity) return null;
    if (!input) return 'input is not defined';
    if (this.env.node && !(input instanceof tf.Tensor)) return 'input must be a tensor';
    try {
      this.tf.getBackend();
    } catch {
      return 'backend not loaded';
    }
    return null;
  }

  /** Process input as return canvas and tensor
   *
   * @param input: {@link Input}
   * @returns { tensor, canvas }
   */
  image = (input: Input) => image.process(input, this.config);

  /** Simmilarity method calculates simmilarity between two provided face descriptors (face embeddings)
   * - Calculation is based on normalized Minkowski distance between two descriptors
   * - Default is Euclidean distance which is Minkowski distance of 2nd order
   *
   * @param embedding1: face descriptor as array of numbers
   * @param embedding2: face descriptor as array of numbers
   * @returns similarity: number
  */
  // eslint-disable-next-line class-methods-use-this
  similarity(embedding1: Array<number>, embedding2: Array<number>): number {
    return faceres.similarity(embedding1, embedding2);
  }

  /** Segmentation method takes any input and returns this.processed canvas with body segmentation
   *  - Optional parameter background is used to fill the background with specific input
   *  - Segmentation is not triggered as part of detect this.process
   *
   * @param input: {@link Input}
   * @param background?: {@link Input}
   * @returns Canvas
   */
  async segmentation(input: Input, background?: Input) {
    return input ? segmentation.process(input, background, this.config) : null;
  }

  /** Enhance method performs additional enhacements to face image previously detected for futher processing
   *
   * @param input: Tensor as provided in human.result.face[n].tensor
   * @returns Tensor
   */
  // eslint-disable-next-line class-methods-use-this
  enhance(input: Tensor): Tensor | null {
    return faceres.enhance(input);
  }

  /** Math method find best match between provided face descriptor and predefined database of known descriptors
   *
   * @param faceEmbedding: face descriptor previsouly calculated on any face
   * @param db: array of mapping of face descriptors to known values
   * @param threshold: minimum score for matching to be considered in the result
   * @returns best match
   */
  // eslint-disable-next-line class-methods-use-this
  match(faceEmbedding: Array<number>, db: Array<{ name: string, source: string, embedding: number[] }>, threshold = 0): { name: string, source: string, similarity: number, embedding: number[] } {
    return faceres.match(faceEmbedding, db, threshold);
  }

  /** Explicit backend initialization
   *  - Normally done implicitly during initial load phase
   *  - Call to explictly register and initialize TFJS backend without any other operations
   *  - Used in webworker environments where there can be multiple instances of Human and not all initialized
   *
   * @return Promise<void>
   */
  init() {
    backend.check(this);
  }

  /** Load method preloads all configured models on-demand
   * - Not explicitly required as any required model is load implicitly on it's first run
   *
   * @param userConfig?: {@link Config}
   * @return Promise<void>
  */
  async load(userConfig?: Partial<Config>) {
    this.state = 'load';
    const timeStamp = now();
    const count = Object.values(this.models).filter((model) => model).length;
    if (userConfig) this.config = mergeDeep(this.config, userConfig) as Config;

    if (env.env.initial) { // print version info on first run and check for correct backend setup
      if (this.config.debug) log(`version: ${this.version}`);
      if (this.config.debug) log(`tfjs version: ${this.tf.version_core}`);
      if (!await backend.check(this)) log('error: backend check failed');
      await tf.ready();
      if (this.env.browser) {
        if (this.config.debug) log('configuration:', this.config);
        if (this.config.debug) log('tf flags:', this.tf.ENV.flags);
      }
    }

    await models.load(this); // actually loads models
    if (env.env.initial && this.config.debug) log('tf engine state:', this.tf.engine().state.numBytes, 'bytes', this.tf.engine().state.numTensors, 'tensors'); // print memory stats on first run
    env.env.initial = false;

    const loaded = Object.values(this.models).filter((model) => model).length;
    if (loaded !== count) { // number of loaded models changed
      await models.validate(this); // validate kernel ops used by model against current backend
      this.emit('load');
    }

    const current = Math.trunc(now() - timeStamp);
    if (current > (this.performance.load as number || 0)) this.performance.load = current;
  }

  // emit event
  /** @hidden */
  emit = (event: string) => this.events?.dispatchEvent(new Event(event));

  /** Runs interpolation using last known result and returns smoothened result
   * Interpolation is based on time since last known result so can be called independently
   *
   * @param result?: {@link Result} optional use specific result set to run interpolation on
   * @returns result: {@link Result}
   */
  next(result: Result = this.result) {
    return interpolate.calc(result) as Result;
  }

  /** Warmup method pre-initializes all configured models for faster inference
   * - can take significant time on startup
   * - only used for `webgl` and `humangl` backends
   * @param userConfig?: {@link Config}
   * @returns result: {@link Result}
  */
  async warmup(userConfig?: Partial<Config>): Promise<Result | { error }> {
    return warmups.warmup(this, userConfig) as Promise<Result | { error }>;
  }

  /** Main detection method
   * - Analyze configuration: {@link Config}
   * - Pre-this.process input: {@link Input}
   * - Run inference for all configured models
   * - Process and return result: {@link Result}
   *
   * @param input: {@link Input}
   * @param userConfig?: {@link Config}
   * @returns result: {@link Result}
  */
  async detect(input: Input, userConfig?: Partial<Config>): Promise<Result | Error> {
    // detection happens inside a promise
    return new Promise(async (resolve) => {
      this.state = 'config';
      let timeStamp;
      let elapsedTime;

      // update configuration
      this.config = mergeDeep(this.config, userConfig) as Config;

      // sanity checks
      this.state = 'check';
      const error = this.#sanity(input);
      if (error) {
        log(error, input);
        resolve({ error });
      }

      const timeStart = now();

      // configure backend if needed
      await backend.check(this);

      // load models if enabled
      await this.load();

      timeStamp = now();
      let img = image.process(input, this.config);
      this.process = img;
      this.performance.image = Math.trunc(now() - timeStamp);
      this.analyze('Get Image:');

      // run segmentation prethis.processing
      if (this.config.segmentation.enabled && this.process && img.tensor && img.canvas) {
        this.analyze('Start Segmentation:');
        this.state = 'run:segmentation';
        timeStamp = now();
        await segmentation.predict(img);
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.segmentation = elapsedTime;
        if (img.canvas) {
          // replace input
          tf.dispose(img.tensor);
          img = image.process(img.canvas, this.config);
        }
        this.analyze('End Segmentation:');
      }

      if (!img.tensor) {
        log('could not convert input to tensor');
        resolve({ error: 'could not convert input to tensor' });
        return;
      }
      this.emit('image');

      timeStamp = now();
      this.config.skipFrame = await image.skip(this.config, img.tensor);
      if (!this.performance.frames) this.performance.frames = 0;
      if (!this.performance.cached) this.performance.cached = 0;
      (this.performance.frames as number)++;
      if (this.config.skipFrame) this.performance.cached++;
      this.performance.changed = Math.trunc(now() - timeStamp);
      this.analyze('Check Changed:');

      // prepare where to store model results
      // keep them with weak typing as it can be promise or not
      let faceRes: FaceResult[] | Promise<FaceResult[]> | never[] = [];
      let bodyRes: BodyResult[] | Promise<BodyResult[]> | never[] = [];
      let handRes: HandResult[] | Promise<HandResult[]> | never[] = [];
      let objectRes: ObjectResult[] | Promise<ObjectResult[]> | never[] = [];

      // run face detection followed by all models that rely on face bounding box: face mesh, age, gender, emotion
      if (this.config.async) {
        faceRes = this.config.face.enabled ? face.detectFace(this, img.tensor) : [];
        if (this.performance.face) delete this.performance.face;
      } else {
        this.state = 'run:face';
        timeStamp = now();
        faceRes = this.config.face.enabled ? await face.detectFace(this, img.tensor) : [];
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.face = elapsedTime;
      }

      // run body: can be posenet, blazepose, efficientpose, movenet
      this.analyze('Start Body:');
      if (this.config.async) {
        if (this.config.body.modelPath?.includes('posenet')) bodyRes = this.config.body.enabled ? posenet.predict(img.tensor, this.config) : [];
        else if (this.config.body.modelPath?.includes('blazepose')) bodyRes = this.config.body.enabled ? blazepose.predict(img.tensor, this.config) : [];
        else if (this.config.body.modelPath?.includes('efficientpose')) bodyRes = this.config.body.enabled ? efficientpose.predict(img.tensor, this.config) : [];
        else if (this.config.body.modelPath?.includes('movenet')) bodyRes = this.config.body.enabled ? movenet.predict(img.tensor, this.config) : [];
        if (this.performance.body) delete this.performance.body;
      } else {
        this.state = 'run:body';
        timeStamp = now();
        if (this.config.body.modelPath?.includes('posenet')) bodyRes = this.config.body.enabled ? await posenet.predict(img.tensor, this.config) : [];
        else if (this.config.body.modelPath?.includes('blazepose')) bodyRes = this.config.body.enabled ? await blazepose.predict(img.tensor, this.config) : [];
        else if (this.config.body.modelPath?.includes('efficientpose')) bodyRes = this.config.body.enabled ? await efficientpose.predict(img.tensor, this.config) : [];
        else if (this.config.body.modelPath?.includes('movenet')) bodyRes = this.config.body.enabled ? await movenet.predict(img.tensor, this.config) : [];
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.body = elapsedTime;
      }
      this.analyze('End Body:');

      // run handpose
      this.analyze('Start Hand:');
      if (this.config.async) {
        handRes = this.config.hand.enabled ? handpose.predict(img.tensor, this.config) : [];
        if (this.performance.hand) delete this.performance.hand;
      } else {
        this.state = 'run:hand';
        timeStamp = now();
        handRes = this.config.hand.enabled ? await handpose.predict(img.tensor, this.config) : [];
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.hand = elapsedTime;
      }
      this.analyze('End Hand:');

      // run nanodet
      this.analyze('Start Object:');
      if (this.config.async) {
        if (this.config.object.modelPath?.includes('nanodet')) objectRes = this.config.object.enabled ? nanodet.predict(img.tensor, this.config) : [];
        else if (this.config.object.modelPath?.includes('centernet')) objectRes = this.config.object.enabled ? centernet.predict(img.tensor, this.config) : [];
        if (this.performance.object) delete this.performance.object;
      } else {
        this.state = 'run:object';
        timeStamp = now();
        if (this.config.object.modelPath?.includes('nanodet')) objectRes = this.config.object.enabled ? await nanodet.predict(img.tensor, this.config) : [];
        else if (this.config.object.modelPath?.includes('centernet')) objectRes = this.config.object.enabled ? await centernet.predict(img.tensor, this.config) : [];
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.object = elapsedTime;
      }
      this.analyze('End Object:');

      // if async wait for results
      if (this.config.async) [faceRes, bodyRes, handRes, objectRes] = await Promise.all([faceRes, bodyRes, handRes, objectRes]);

      // run gesture analysis last
      let gestureRes: GestureResult[] = [];
      if (this.config.gesture.enabled) {
        timeStamp = now();
        gestureRes = [...gesture.face(faceRes), ...gesture.body(bodyRes), ...gesture.hand(handRes), ...gesture.iris(faceRes)];
        if (!this.config.async) this.performance.gesture = Math.trunc(now() - timeStamp);
        else if (this.performance.gesture) delete this.performance.gesture;
      }

      this.performance.total = Math.trunc(now() - timeStart);
      this.state = 'idle';
      const shape = this.process?.tensor?.shape || [];
      this.result = {
        face: faceRes as FaceResult[],
        body: bodyRes as BodyResult[],
        hand: handRes as HandResult[],
        gesture: gestureRes,
        object: objectRes as ObjectResult[],
        performance: this.performance,
        canvas: this.process.canvas,
        timestamp: Date.now(),
        get persons() { return persons.join(faceRes as FaceResult[], bodyRes as BodyResult[], handRes as HandResult[], gestureRes, shape); },
      };

      // finally dispose input tensor
      tf.dispose(img.tensor);

      // log('Result:', result);
      this.emit('detect');
      resolve(this.result);
    });
  }
}

/** Class Human as default export */
export { Human as default };
