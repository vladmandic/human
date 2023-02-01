/**
 * Human main module
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */

// module imports
import * as tf from 'dist/tfjs.esm.js';
import { log, now, mergeDeep, validate } from './util/util';
import { defaults } from './config';
import { env, Env } from './util/env';
import { WebCam } from './util/webcam';
import { setModelLoadOptions } from './tfjs/load';
import * as app from '../package.json';
import * as backend from './tfjs/backend';
import * as draw from './draw/draw';
import * as blazepose from './body/blazepose';
import * as centernet from './object/centernet';
import * as efficientpose from './body/efficientpose';
import * as face from './face/face';
import * as facemesh from './face/facemesh';
import * as gesture from './gesture/gesture';
import * as handpose from './hand/handpose';
import * as handtrack from './hand/handtrack';
import * as image from './image/image';
import * as interpolate from './util/interpolate';
import * as meet from './segmentation/meet';
import * as match from './face/match';
import * as models from './models';
import * as movenet from './body/movenet';
import * as nanodet from './object/nanodet';
import * as persons from './util/persons';
import * as posenet from './body/posenet';
import * as rvm from './segmentation/rvm';
import * as selfie from './segmentation/selfie';
import * as warmups from './warmup';

// type definitions
import { Input, Config, Result, FaceResult, HandResult, BodyResult, ObjectResult, GestureResult, AnyCanvas, empty } from './exports';
import type { Tensor, Tensor4D } from './tfjs/types';
// type exports
export * from './exports';

/** **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 *
 * @param userConfig - {@link Config}
 * @returns instance of {@link Human}
 */
export class Human {
  /** Current version of Human library in *semver* format */
  version: string;

  /** Current configuration
   * - Defaults: [config](https://github.com/vladmandic/human/blob/main/src/config.ts#L262)
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
  process: { tensor: Tensor | null, canvas: AnyCanvas | null };

  /** Instance of TensorFlow/JS used by Human
   *  - Can be embedded or externally provided
   * [TFJS API](https://js.tensorflow.org/api/latest/)
   */
  tf;

  /** Object containing environment information used for diagnostics */
  env: Env = env;

  /** Draw helper classes that can draw detected objects on canvas using specified draw
   * - canvas: draws input to canvas
   * - options: are global settings for all draw operations, can be overriden for each draw method {@link DrawOptions}
   * - face, body, hand, gesture, object, person: draws detected results as overlays on canvas
   */
  // draw: { canvas: typeof draw.canvas, face: typeof draw.face, body: typeof draw.body, hand: typeof draw.hand, gesture: typeof draw.gesture, object: typeof draw.object, person: typeof draw.person, all: typeof draw.all, options: DrawOptions };
  draw: typeof draw = draw;

  /** Face Matching
   * - similarity: compare two face descriptors and return similarity index
   * - distance: compare two face descriptors and return raw calculated differences
   * - find: compare face descriptor to array of face descriptors and return best match
   */
  match: typeof match = match;

  /** Currently loaded models
   * @internal
   * {@link models#Models}
  */
  models: models.Models;

  /** Container for events dispatched by Human
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
  faceTriangulation: number[];
  /** Refernce UV map of 468 values, used for 3D mapping of the face mesh */
  faceUVMap: [number, number][];
  /** Performance object that contains values for all recently performed operations */
  performance: Record<string, number>; // perf members are dynamically defined as needed
  #numTensors: number;
  #analyzeMemoryLeaks: boolean;
  #checkSanity: boolean;
  // definition end

  /** Constructor for **Human** library that is futher used for all operations
   * @param userConfig - user configuration object {@link Config}
   */
  constructor(userConfig?: Partial<Config>) {
    /*
    defaults.wasmPath = tf.version['tfjs-core'].includes('-') // custom build or official build
      ? 'https://vladmandic.github.io/tfjs/dist/'
      : `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tf.version_core}/dist/`;
    */
    const tfVersion = (tf.version.tfjs || tf.version_core).replace(/-(.*)/, '');
    defaults.wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfVersion}/dist/`;
    defaults.modelBasePath = env.browser ? '../models/' : 'file://models/';
    this.version = app.version; // expose version property on instance of class
    Object.defineProperty(this, 'version', { value: app.version }); // expose version property directly on class itself
    this.config = JSON.parse(JSON.stringify(defaults));
    Object.seal(this.config);
    this.config.cacheModels = typeof indexedDB !== 'undefined';
    if (userConfig) this.config = mergeDeep(this.config, userConfig);
    setModelLoadOptions(this.config);
    this.tf = tf;
    this.state = 'idle';
    this.#numTensors = 0;
    this.#analyzeMemoryLeaks = false;
    this.#checkSanity = false;
    this.performance = {};
    this.events = (typeof EventTarget !== 'undefined') ? new EventTarget() : undefined;
    // object that contains all initialized models
    this.models = new models.Models(this);
    // reexport draw methods
    draw.init();
    this.result = empty();
    // export access to image processing
    this.process = { tensor: null, canvas: null };
    // export raw access to underlying models
    this.faceTriangulation = facemesh.triangulation;
    this.faceUVMap = facemesh.uvmap;
    // init model validation
    models.validateModel(this, null, '');
    // include platform info
    this.emit('create');
    if (this.config.debug || this.env.browser) log(`version: ${this.version}`);
    if (this.config.debug) log(`tfjs version: ${this.tf.version['tfjs-core']}`);
    const envTemp = JSON.parse(JSON.stringify(this.env));
    delete envTemp.kernels;
    delete envTemp.initial;
    delete envTemp.perfadd;
    if (this.config.debug) log('environment:', envTemp);
  }

  /** internal function to measure tensor leaks */
  analyze = (...msg: string[]) => {
    if (!this.#analyzeMemoryLeaks) return;
    const currentTensors = this.tf.engine().state.numTensors;
    const previousTensors = this.#numTensors;
    this.#numTensors = currentTensors;
    const leaked = currentTensors - previousTensors;
    if (leaked !== 0) log(...msg, leaked);
  };

  /** internal function for quick sanity check on inputs @hidden */
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
    image.reset();
    env.initial = true;
  }

  /** Validate current configuration schema */
  validate(userConfig?: Partial<Config>) {
    const msgs = validate(defaults, userConfig || this.config);
    if (msgs.length === 0) this.config = mergeDeep(this.config, userConfig) as Config;
    return msgs;
  }

  /** Utility wrapper for performance.now() */
  now(): number { // eslint-disable-line class-methods-use-this
    return now();
  }

  /** Process input as return canvas and tensor
   *
   * @param input - any input {@link Input}
   * @param getTensor - should image processing also return tensor or just canvas
   * Returns object with `tensor` and `canvas`
   */
  image(input: Input, getTensor: boolean = false) {
    return image.process(input, this.config, getTensor);
  }

  /** Segmentation method takes any input and returns RGBA tensor
   * Note: Segmentation is not triggered as part of detect process
   *
   * @param input - {@link Input}
   * Returns tensor which contains image data in RGBA format
   */
  async segmentation(input: Input, userConfig?: Partial<Config>): Promise<Tensor | null> {
    if (userConfig) this.config = mergeDeep(this.config, userConfig) as Config;
    if (!this.config.segmentation.enabled) return null;
    const processed = await image.process(input, this.config);
    if (!processed.tensor) return null;
    let tensor: Tensor | null = null;
    if (this.config.segmentation.modelPath?.includes('rvm')) tensor = await rvm.predict(processed.tensor, this.config);
    if (this.config.segmentation.modelPath?.includes('meet')) tensor = await meet.predict(processed.tensor, this.config);
    if (this.config.segmentation.modelPath?.includes('selfie')) tensor = await selfie.predict(processed.tensor, this.config);
    tf.dispose(processed.tensor);
    return tensor;
  }

  /** Compare two input tensors for pixel similarity
   * - use `human.image` to process any valid input and get a tensor that can be used for compare
   * - when passing manually generated tensors:
   *  - both input tensors must be in format [1, height, width, 3]
   *  - if resolution of tensors does not match, second tensor will be resized to match resolution of the first tensor
   * - return value is pixel similarity score normalized by input resolution and rgb channels
  */
  compare(firstImageTensor: Tensor, secondImageTensor: Tensor): Promise<number> {
    return image.compare(this.config, firstImageTensor, secondImageTensor);
  }

  /** Explicit backend initialization
   *  - Normally done implicitly during initial load phase
   *  - Call to explictly register and initialize TFJS backend without any other operations
   *  - Use when changing backend during runtime
   */
  async init(): Promise<void> {
    await backend.check(this, true);
    await this.tf.ready();
    image.reset();
  }

  /** WebCam helper methods
   *
   */
  public webcam = new WebCam();

  /** Load method preloads all configured models on-demand
   * - Not explicitly required as any required model is load implicitly on it's first run
   *
   * @param userConfig - {@link Config}
  */
  async load(userConfig?: Partial<Config>): Promise<void> {
    this.state = 'load';
    const timeStamp = now();
    const count = Object.values(this.models.models).filter((model) => model).length;
    if (userConfig) this.config = mergeDeep(this.config, userConfig) as Config;
    if (this.env.initial) { // print version info on first run and check for correct backend setup
      if (!await backend.check(this, false)) log('error: backend check failed');
      await tf.ready();
      if (this.env.browser) {
        if (this.config.debug) log('configuration:', this.config);
        if (this.config.debug) log('tf flags:', this.tf.ENV.flags);
      }
    }

    await this.models.load(this); // actually loads models
    if (this.env.initial && this.config.debug) log('tf engine state:', this.tf.engine().state.numBytes, 'bytes', this.tf.engine().state.numTensors, 'tensors'); // print memory stats on first run
    this.env.initial = false;

    const loaded = Object.values(this.models.models).filter((model) => model).length;
    if (loaded !== count) { // number of loaded models changed
      this.models.validate(); // validate kernel ops used by model against current backend
      this.emit('load');
    }

    const current = Math.trunc(now() - timeStamp);
    if (current > (this.performance.loadModels || 0)) this.performance.loadModels = this.env.perfadd ? (this.performance.loadModels || 0) + current : current;
  }

  /** emit event */
  emit = (event: string) => {
    if (this.events?.dispatchEvent) this.events.dispatchEvent(new Event(event));
  };

  /** Runs interpolation using last known result and returns smoothened result
   * Interpolation is based on time since last known result so can be called independently
   *
   * @param result - {@link Result} optional use specific result set to run interpolation on
   * @returns result - {@link Result}
   */
  next(result: Result = this.result): Result {
    return interpolate.calc(result, this.config);
  }

  /** Warmup method pre-initializes all configured models for faster inference
   * - can take significant time on startup
   * - only used for `webgl` and `humangl` backends
   * @param userConfig - {@link Config}
   * @returns result - {@link Result}
  */
  async warmup(userConfig?: Partial<Config>) {
    const t0 = now();
    const res = await warmups.warmup(this, userConfig);
    const t1 = now();
    this.performance.warmup = Math.trunc(t1 - t0);
    return res;
  }

  /** Run detect with tensorflow profiling
   * - result object will contain total exeuction time information for top-20 kernels
   * - actual detection object can be accessed via `human.result`
  */
  async profile(input: Input, userConfig?: Partial<Config>): Promise<{ kernel: string, time: number, perc: number }[]> {
    // @ts-ignore profile wraps method return values
    const profile = await this.tf.profile(() => this.detect(input, userConfig));
    const kernels: Record<string, number> = {};
    let total = 0;
    for (const kernel of profile.kernels) { // sum kernel time values per kernel
      const ms = Number(kernel.kernelTimeMs) || 0;
      if (kernels[kernel.name]) kernels[kernel.name] += ms;
      else kernels[kernel.name] = ms;
      total += ms;
    }
    const kernelArr: { kernel: string, time: number, perc: number }[] = [];
    Object.entries(kernels).forEach((key) => kernelArr.push({ kernel: key[0], time: key[1] as unknown as number, perc: 0 })); // convert to array
    for (const kernel of kernelArr) {
      kernel.perc = Math.round(1000 * kernel.time / total) / 1000;
      kernel.time = Math.round(1000 * kernel.time) / 1000;
    }
    kernelArr.sort((a, b) => b.time - a.time); // sort
    kernelArr.length = 20; // crop
    return kernelArr;
  }

  /** Main detection method
   * - Analyze configuration: {@link Config}
   * - Pre-process input: {@link Input}
   * - Run inference for all configured models
   * - Process and return result: {@link Result}
   *
   * @param input - {@link Input}
   * @param userConfig - {@link Config}
   * @returns result - {@link Result}
  */
  async detect(input: Input, userConfig?: Partial<Config>): Promise<Result> {
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
        this.emit('error');
        resolve(empty(error));
      }

      const timeStart = now();

      // load models if enabled
      await this.load();

      timeStamp = now();
      this.state = 'image';
      const img = await image.process(input, this.config) as { canvas: AnyCanvas, tensor: Tensor4D };
      this.process = img;
      this.performance.inputProcess = this.env.perfadd ? (this.performance.inputProcess || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
      this.analyze('Get Image:');

      if (!img.tensor) {
        if (this.config.debug) log('could not convert input to tensor');
        this.emit('error');
        resolve(empty('could not convert input to tensor'));
        return;
      }
      this.emit('image');

      timeStamp = now();
      this.config.skipAllowed = await image.skip(this.config, img.tensor);
      this.config.filter.autoBrightness = (this.config.filter.autoBrightness || false) && this.config.skipAllowed; // disable autoBrightness on scene change
      if (!this.performance.totalFrames) this.performance.totalFrames = 0;
      if (!this.performance.cachedFrames) this.performance.cachedFrames = 0;
      (this.performance.totalFrames)++;
      if (this.config.skipAllowed) this.performance.cachedFrames++;
      this.performance.cacheCheck = this.env.perfadd ? (this.performance.cacheCheck || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
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

      // run object detection
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
        gestureRes = [...gesture.face(faceRes as FaceResult[]), ...gesture.body(bodyRes as BodyResult[]), ...gesture.hand(handRes as HandResult[]), ...gesture.iris(faceRes as FaceResult[])];
        if (!this.config.async) this.performance.gesture = this.env.perfadd ? (this.performance.gesture || 0) + Math.trunc(now() - timeStamp) : Math.trunc(now() - timeStamp);
        else if (this.performance.gesture) delete this.performance.gesture;
      }

      this.performance.total = this.env.perfadd ? (this.performance.total || 0) + Math.trunc(now() - timeStart) : Math.trunc(now() - timeStart);
      const shape = this.process.tensor?.shape || [0, 0, 0, 0];
      this.result = {
        face: faceRes as FaceResult[],
        body: bodyRes as BodyResult[],
        hand: handRes as HandResult[],
        gesture: gestureRes,
        object: objectRes as ObjectResult[],
        performance: this.performance,
        canvas: this.process.canvas,
        timestamp: Date.now(),
        error: null,
        width: shape[2],
        height: shape[1],
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

  /** Helper function
   * @param ms - sleep time in miliseconds
   */
  async sleep(ms: number): Promise<void> { // eslint-disable-line class-methods-use-this
    return new Promise((resolve) => { setTimeout(resolve, ms); });
  }

  /** internal structure that keeps track of processed videos @hidden */
  #loops: Record<string, boolean> = {};
  /** Continously detect video frames
   * @param element - HTMLVideoElement input
   * @param run - boolean run continously or stop if already running, default true
   * @param delay - number delay detection between frames for number of miliseconds, default 0
   */
  async video(element: HTMLVideoElement, run: boolean = true, delay: number = 0) {
    if (run) {
      if (!this.#loops[element.id]) {
        if (this.config.debug) log('video start', element.id);
        this.#loops[element.id] = true;
      }
      if (!element.paused && this.#loops[element.id] && (element.readyState >= 2)) await this.detect(element);
      if (delay > 0) await this.sleep(delay);
      if (this.#loops[element.id]) requestAnimationFrame(() => this.video(element, run, delay));
    } else {
      if (this.config.debug) log('video stop', element.id);
      this.#loops[element.id] = false;
    }
  }
}

/** Class Human as default export */
/* eslint no-restricted-exports: ["off", { "restrictedNamedExports": ["default"] }] */
export { Human as default, match, draw, models };
