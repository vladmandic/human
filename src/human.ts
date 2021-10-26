/**
 * Human main module
 * @author <https://github.com/vladmandic>
 */

// module imports
import { log, now, mergeDeep, validate } from './util/util';
import { defaults } from './config';
import { env, Env } from './util/env';
import * as tf from '../dist/tfjs.esm.js';
import * as app from '../package.json';
import * as backend from './tfjs/backend';
import * as blazepose from './body/blazepose';
import * as centernet from './object/centernet';
import * as draw from './util/draw';
import * as efficientpose from './body/efficientpose';
import * as face from './face/face';
import * as facemesh from './face/facemesh';
import * as faceres from './face/faceres';
import * as gesture from './gesture/gesture';
import * as handpose from './hand/handpose';
import * as handtrack from './hand/handtrack';
import * as humangl from './tfjs/humangl';
import * as image from './image/image';
import * as interpolate from './util/interpolate';
import * as match from './face/match';
import * as models from './models';
import * as movenet from './body/movenet';
import * as nanodet from './object/nanodet';
import * as persons from './util/persons';
import * as posenet from './body/posenet';
import * as segmentation from './segmentation/segmentation';
import * as warmups from './warmup';
// type definitions
import type { Input, Tensor, DrawOptions, Config, Result, FaceResult, HandResult, BodyResult, ObjectResult, GestureResult, PersonResult } from './exports';
// type exports
export * from './exports';

/** Instance of TensorFlow/JS used by Human
 * - Can be TFJS that is bundled with `Human` or a manually imported TFJS library
 * @external [API](https://js.tensorflow.org/api/latest/)
 */
export type TensorFlow = typeof tf;

/** Error message */
export type Error = {
  /** @property error message */
  error: string,
};

/** **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 *
 * @param userConfig: {@link Config}
 * @returns instance of {@link Human}
 */
export class Human {
  /** Current version of Human library in *semver* format */
  version: string;

  /** Current configuration
   * - Defaults: [config](https://github.com/vladmandic/human/blob/main/src/config.ts#L250)
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
   *
   * [TFJS API]<https://js.tensorflow.org/api/latest/>
   */
  tf: TensorFlow;

  /** Object containing environment information used for diagnostics */
  env: Env;

  /** Draw helper classes that can draw detected objects on canvas using specified draw
   * @property options global settings for all draw operations, can be overriden for each draw method {@link DrawOptions}
   */
  draw: { canvas: typeof draw.canvas, face: typeof draw.face, body: typeof draw.body, hand: typeof draw.hand, gesture: typeof draw.gesture, object: typeof draw.object, person: typeof draw.person, all: typeof draw.all, options: DrawOptions };

  /** Currently loaded models
   * @internal
   * {@link Models}
  */
  models: models.Models;

  /** Container for events dispatched by Human
   * {@type} EventTarget
   * Possible events:
   * - `create`: triggered when Human object is instantiated
   * - `load`: triggered when models are loaded (explicitly or on-demand)
   * - `image`: triggered when input image is processed
   * - `result`: triggered when detection is complete
   * - `warmup`: triggered when warmup is complete
   * - `error`: triggered on some errors
   */
  events: EventTarget | undefined;
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
   * @param {Config} userConfig
   * @returns {Human}
   */
  constructor(userConfig?: Partial<Config>) {
    this.env = env;
    defaults.wasmPath = tf.version_core.includes('-') // custom build or official build
      ? 'https://vladmandic.github.io/tfjs/dist/'
      : `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tf.version_core}/dist/`;
    defaults.modelBasePath = env.browser ? '../models/' : 'file://models/';
    defaults.backend = env.browser ? 'humangl' : 'tensorflow';
    this.version = app.version; // expose version property on instance of class
    Object.defineProperty(this, 'version', { value: app.version }); // expose version property directly on class itself
    this.config = JSON.parse(JSON.stringify(defaults));
    Object.seal(this.config);
    if (userConfig) this.config = mergeDeep(this.config, userConfig);
    this.tf = tf;
    this.state = 'idle';
    this.#numTensors = 0;
    this.#analyzeMemoryLeaks = false;
    this.#checkSanity = false;
    this.performance = { backend: 0, load: 0, image: 0, frames: 0, cached: 0, changed: 0, total: 0, draw: 0 };
    this.events = (typeof EventTarget !== 'undefined') ? new EventTarget() : undefined;
    // object that contains all initialized models
    this.models = new models.Models();
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
    // export access to image processing
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
  };

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
  };

  /** Reset configuration to default values */
  reset(): void {
    const currentBackend = this.config.backend; // save backend;
    this.config = JSON.parse(JSON.stringify(defaults));
    this.config.backend = currentBackend;
  }

  /** Validate current configuration schema */
  validate(userConfig?: Partial<Config>) {
    return validate(defaults, userConfig || this.config);
  }

  /** Exports face matching methods */
  public similarity = match.similarity;
  public distance = match.distance;
  public match = match.match;

  /** Utility wrapper for performance.now() */
  now(): number {
    return now();
  }

  /** Process input as return canvas and tensor
   *
   * @param input: {@link Input}
   * @param {boolean} input.getTensor should image processing also return tensor or just canvas
   * @returns { tensor, canvas }
   */
  image(input: Input, getTensor: boolean = true) {
    return image.process(input, this.config, getTensor);
  }

  /** Segmentation method takes any input and returns processed canvas with body segmentation
   *  - Segmentation is not triggered as part of detect process
   *
   *  Returns:
   *
   * @param input: {@link Input}
   * @param background?: {@link Input}
   *  - Optional parameter background is used to fill the background with specific input
   * @returns {object}
   *  - `data` as raw data array with per-pixel segmentation values
   *  - `canvas` as canvas which is input image filtered with segementation data and optionally merged with background image. canvas alpha values are set to segmentation values for easy merging
   *  - `alpha` as grayscale canvas that represents segmentation alpha values
   */
  async segmentation(input: Input, background?: Input): Promise<{ data: number[], canvas: HTMLCanvasElement | OffscreenCanvas | null, alpha: HTMLCanvasElement | OffscreenCanvas | null }> {
    return segmentation.process(input, background, this.config);
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

  /** Explicit backend initialization
   *  - Normally done implicitly during initial load phase
   *  - Call to explictly register and initialize TFJS backend without any other operations
   *  - Use when changing backend during runtime
   *
   * @returns {void}
   */
  async init(): Promise<void> {
    await backend.check(this, true);
    await this.tf.ready();
  }

  /** Load method preloads all configured models on-demand
   * - Not explicitly required as any required model is load implicitly on it's first run
   *
   * @param userConfig?: {@link Config}
   * @return Promise<void>
  */
  async load(userConfig?: Partial<Config>): Promise<void> {
    this.state = 'load';
    const timeStamp = now();
    const count = Object.values(this.models).filter((model) => model).length;
    if (userConfig) this.config = mergeDeep(this.config, userConfig) as Config;

    if (this.env.initial) { // print version info on first run and check for correct backend setup
      if (this.config.debug) log(`version: ${this.version}`);
      if (this.config.debug) log(`tfjs version: ${this.tf.version_core}`);
      if (!await backend.check(this)) log('error: backend check failed');
      await tf.ready();
      if (this.env.browser) {
        if (this.config.debug) log('configuration:', this.config);
        if (this.config.debug) log('tf flags:', this.tf.ENV['flags']);
      }
    }

    await models.load(this); // actually loads models
    if (this.env.initial && this.config.debug) log('tf engine state:', this.tf.engine().state.numBytes, 'bytes', this.tf.engine().state.numTensors, 'tensors'); // print memory stats on first run
    this.env.initial = false;

    const loaded = Object.values(this.models).filter((model) => model).length;
    if (loaded !== count) { // number of loaded models changed
      await models.validate(this); // validate kernel ops used by model against current backend
      this.emit('load');
    }

    const current = Math.trunc(now() - timeStamp);
    if (current > (this.performance.load as number || 0)) this.performance.load = this.env.perfadd ? (this.performance.load || 0) + current : current;
  }

  // emit event
  /** @hidden */
  emit = (event: string) => {
    if (this.events && this.events.dispatchEvent) this.events?.dispatchEvent(new Event(event));
  };

  /** Runs interpolation using last known result and returns smoothened result
   * Interpolation is based on time since last known result so can be called independently
   *
   * @param result?: {@link Result} optional use specific result set to run interpolation on
   * @returns result: {@link Result}
   */
  next(result: Result = this.result): Result {
    return interpolate.calc(result, this.config) as Result;
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
   * - Pre-process input: {@link Input}
   * - Run inference for all configured models
   * - Process and return result: {@link Result}
   *
   * @param input: {@link Input}
   * @param userConfig?: {@link Config}
   * @returns result: {@link Result}
  */
  async detect(input: Input, userConfig?: Partial<Config>): Promise<Result | Error> {
    // detection happens inside a promise
    this.state = 'detect';
    return new Promise(async (resolve) => {
      this.state = 'config';
      let timeStamp;

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
      this.state = 'image';
      const img = image.process(input, this.config) as { canvas: HTMLCanvasElement | OffscreenCanvas, tensor: Tensor };
      this.process = img;
      this.performance.image = this.env.perfadd ? (this.performance.image || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
      this.analyze('Get Image:');

      if (!img.tensor) {
        if (this.config.debug) log('could not convert input to tensor');
        resolve({ error: 'could not convert input to tensor' });
        return;
      }
      this.emit('image');

      timeStamp = now();
      this.config.skipAllowed = await image.skip(this.config, img.tensor);
      if (!this.performance.frames) this.performance.frames = 0;
      if (!this.performance.cached) this.performance.cached = 0;
      (this.performance.frames as number)++;
      if (this.config.skipAllowed) this.performance.cached++;
      this.performance.changed = this.env.perfadd ? (this.performance.changed || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
      this.analyze('Check Changed:');

      // prepare where to store model results
      // keep them with weak typing as it can be promise or not
      let faceRes: FaceResult[] | Promise<FaceResult[]> | never[] = [];
      let bodyRes: BodyResult[] | Promise<BodyResult[]> | never[] = [];
      let handRes: HandResult[] | Promise<HandResult[]> | never[] = [];
      let objectRes: ObjectResult[] | Promise<ObjectResult[]> | never[] = [];

      // run face detection followed by all models that rely on face bounding box: face mesh, age, gender, emotion
      this.state = 'detect:face';
      if (this.config.async) {
        faceRes = this.config.face.enabled ? face.detectFace(this, img.tensor) : [];
        if (this.performance.face) delete this.performance.face;
      } else {
        timeStamp = now();
        faceRes = this.config.face.enabled ? await face.detectFace(this, img.tensor) : [];
        this.performance.face = this.env.perfadd ? (this.performance.face || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
      }

      if (this.config.async && (this.config.body.maxDetected === -1 || this.config.hand.maxDetected === -1)) faceRes = await faceRes; // need face result for auto-detect number of hands or bodies

      // run body: can be posenet, blazepose, efficientpose, movenet
      this.analyze('Start Body:');
      this.state = 'detect:body';
      const bodyConfig = this.config.body.maxDetected === -1 ? mergeDeep(this.config, { body: { maxDetected: this.config.face.enabled ? 1 * (faceRes as FaceResult[]).length : 1 } }) : this.config; // autodetect number of bodies
      if (this.config.async) {
        if (this.config.body.modelPath?.includes('posenet')) bodyRes = this.config.body.enabled ? posenet.predict(img.tensor, bodyConfig) : [];
        else if (this.config.body.modelPath?.includes('blazepose')) bodyRes = this.config.body.enabled ? blazepose.predict(img.tensor, bodyConfig) : [];
        else if (this.config.body.modelPath?.includes('efficientpose')) bodyRes = this.config.body.enabled ? efficientpose.predict(img.tensor, bodyConfig) : [];
        else if (this.config.body.modelPath?.includes('movenet')) bodyRes = this.config.body.enabled ? movenet.predict(img.tensor, bodyConfig) : [];
        if (this.performance.body) delete this.performance.body;
      } else {
        timeStamp = now();
        if (this.config.body.modelPath?.includes('posenet')) bodyRes = this.config.body.enabled ? await posenet.predict(img.tensor, bodyConfig) : [];
        else if (this.config.body.modelPath?.includes('blazepose')) bodyRes = this.config.body.enabled ? await blazepose.predict(img.tensor, bodyConfig) : [];
        else if (this.config.body.modelPath?.includes('efficientpose')) bodyRes = this.config.body.enabled ? await efficientpose.predict(img.tensor, bodyConfig) : [];
        else if (this.config.body.modelPath?.includes('movenet')) bodyRes = this.config.body.enabled ? await movenet.predict(img.tensor, bodyConfig) : [];
        this.performance.body = this.env.perfadd ? (this.performance.body || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
      }
      this.analyze('End Body:');

      // run handpose
      this.analyze('Start Hand:');
      this.state = 'detect:hand';
      const handConfig = this.config.hand.maxDetected === -1 ? mergeDeep(this.config, { hand: { maxDetected: this.config.face.enabled ? 2 * (faceRes as FaceResult[]).length : 1 } }) : this.config; // autodetect number of hands
      if (this.config.async) {
        if (this.config.hand.detector?.modelPath?.includes('handdetect')) handRes = this.config.hand.enabled ? handpose.predict(img.tensor, handConfig) : [];
        else if (this.config.hand.detector?.modelPath?.includes('handtrack')) handRes = this.config.hand.enabled ? handtrack.predict(img.tensor, handConfig) : [];
        if (this.performance.hand) delete this.performance.hand;
      } else {
        timeStamp = now();
        if (this.config.hand.detector?.modelPath?.includes('handdetect')) handRes = this.config.hand.enabled ? await handpose.predict(img.tensor, handConfig) : [];
        else if (this.config.hand.detector?.modelPath?.includes('handtrack')) handRes = this.config.hand.enabled ? await handtrack.predict(img.tensor, handConfig) : [];
        this.performance.hand = this.env.perfadd ? (this.performance.hand || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
      }
      this.analyze('End Hand:');

      // run nanodet
      this.analyze('Start Object:');
      this.state = 'detect:object';
      if (this.config.async) {
        if (this.config.object.modelPath?.includes('nanodet')) objectRes = this.config.object.enabled ? nanodet.predict(img.tensor, this.config) : [];
        else if (this.config.object.modelPath?.includes('centernet')) objectRes = this.config.object.enabled ? centernet.predict(img.tensor, this.config) : [];
        if (this.performance.object) delete this.performance.object;
      } else {
        timeStamp = now();
        if (this.config.object.modelPath?.includes('nanodet')) objectRes = this.config.object.enabled ? await nanodet.predict(img.tensor, this.config) : [];
        else if (this.config.object.modelPath?.includes('centernet')) objectRes = this.config.object.enabled ? await centernet.predict(img.tensor, this.config) : [];
        this.performance.object = this.env.perfadd ? (this.performance.object || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
      }
      this.analyze('End Object:');

      // if async wait for results
      this.state = 'detect:await';
      if (this.config.async) [faceRes, bodyRes, handRes, objectRes] = await Promise.all([faceRes, bodyRes, handRes, objectRes]);

      // run gesture analysis last
      this.state = 'detect:gesture';
      let gestureRes: GestureResult[] = [];
      if (this.config.gesture.enabled) {
        timeStamp = now();
        gestureRes = [...gesture.face(faceRes), ...gesture.body(bodyRes), ...gesture.hand(handRes), ...gesture.iris(faceRes)];
        if (!this.config.async) this.performance.gesture = this.env.perfadd ? (this.performance.gesture || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
        else if (this.performance.gesture) delete this.performance.gesture;
      }

      this.performance.total = Math.trunc(now() - timeStart);
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
      this.state = 'idle';
      resolve(this.result);
    });
  }
}

/** Class Human as default export */
export { Human as default };
