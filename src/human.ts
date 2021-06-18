/**
 * Human main module
 */

import { log, now, mergeDeep } from './helpers';
import { Config, defaults } from './config';
import { Result, Gesture } from './result';
import * as sysinfo from './sysinfo';
import * as tf from '../dist/tfjs.esm.js';
import * as backend from './tfjs/backend';
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
import * as draw from './draw/draw';
import * as persons from './persons';
import * as interpolate from './interpolate';
import * as sample from './sample';
import * as app from '../package.json';
import { Tensor, GraphModel } from './tfjs/types';

// export types
export type { Config } from './config';
export type { Result, Face, Hand, Body, Item, Gesture, Person } from './result';
export type { DrawOptions } from './draw/draw';

/** Defines all possible input types for **Human** detection
 * @typedef Input Type
 */
export type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;

/** Error message
 * @typedef Error Type
 */
export type Error = { error: string };

/** Instance of TensorFlow/JS
 * @external
 */
export type TensorFlow = typeof tf;

/**
 * **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 *
 * @param userConfig: {@link Config}
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
  /** @internal: Instance of current image being processed */
  image: { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement | null };
  /** @internal: Instance of TensorFlow/JS used by Human
   * - Can be embedded or externally provided
   */
  tf: TensorFlow;
  /** Draw helper classes that can draw detected objects on canvas using specified draw
   * - options: {@link DrawOptions} global settings for all draw operations, can be overriden for each draw method
   * - face: draw detected faces
   * - body: draw detected people and body parts
   * - hand: draw detected hands and hand parts
   * - canvas: draw processed canvas which is a processed copy of the input
   * - all: meta-function that performs: canvas, face, body, hand
   */
  draw: {
    options: draw.DrawOptions,
    gesture: typeof draw.gesture,
    face: typeof draw.face,
    body: typeof draw.body,
    hand: typeof draw.hand,
    canvas: typeof draw.canvas,
    all: typeof draw.all,
  };
  /** @internal: Currently loaded models */
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
  /** Reference face triangualtion array of 468 points, used for triangle references between points */
  faceTriangulation: typeof facemesh.triangulation;
  /** Refernce UV map of 468 values, used for 3D mapping of the face mesh */
  faceUVMap: typeof facemesh.uvmap;
  /** Platform and agent information detected by Human */
  sysinfo: { platform: string, agent: string };
  /** Performance object that contains values for all recently performed operations */
  performance: Record<string, number>; // perf members are dynamically defined as needed
  #numTensors: number;
  #analyzeMemoryLeaks: boolean;
  #checkSanity: boolean;
  #firstRun: boolean;
  #lastInputSum: number;
  #lastCacheDiff: number;

  // definition end

  /**
   * Creates instance of Human library that is futher used for all operations
   * @param userConfig: {@link Config}
   */
  constructor(userConfig?: Config | Record<string, unknown>) {
    this.config = mergeDeep(defaults, userConfig || {});
    this.tf = tf;
    this.draw = draw;
    this.version = app.version;
    this.state = 'idle';
    this.#numTensors = 0;
    this.#analyzeMemoryLeaks = false;
    this.#checkSanity = false;
    this.#firstRun = true;
    this.#lastCacheDiff = 0;
    this.performance = { backend: 0, load: 0, image: 0, frames: 0, cached: 0, changed: 0, total: 0, draw: 0 };
    // object that contains all initialized models
    this.models = {
      face: null,
      posenet: null,
      blazepose: null,
      efficientpose: null,
      movenet: null,
      handpose: null,
      age: null,
      gender: null,
      emotion: null,
      embedding: null,
      nanodet: null,
      centernet: null,
      faceres: null,
      segmentation: null,
    };
    // export access to image processing
    // @ts-ignore eslint-typescript cannot correctly infer type in anonymous function
    this.image = (input: Input) => image.process(input, this.config);
    // export raw access to underlying models
    this.faceTriangulation = facemesh.triangulation;
    this.faceUVMap = facemesh.uvmap;
    // include platform info
    this.sysinfo = sysinfo.info();
    this.#lastInputSum = 1;
  }

  // helper function: measure tensor leak
  /** @hidden */
  analyze = (...msg) => {
    if (!this.#analyzeMemoryLeaks) return;
    const currentTensors = this.tf.engine().state.numTensors;
    const previousTensors = this.#numTensors;
    this.#numTensors = currentTensors;
    const leaked = currentTensors - previousTensors;
    if (leaked !== 0) log(...msg, leaked);
  }

  // quick sanity check on inputs
  /** @hidden */
  #sanity = (input): null | string => {
    if (!this.#checkSanity) return null;
    if (!input) return 'input is not defined';
    if (this.tf.ENV.flags.IS_NODE && !(input instanceof tf.Tensor)) return 'input must be a tensor';
    try {
      this.tf.getBackend();
    } catch {
      return 'backend not loaded';
    }
    return null;
  }

  /** Simmilarity method calculates simmilarity between two provided face descriptors (face embeddings)
   * - Calculation is based on normalized Minkowski distance between
   *
   * @param embedding1: face descriptor as array of numbers
   * @param embedding2: face descriptor as array of numbers
   * @returns similarity: number
  */
  // eslint-disable-next-line class-methods-use-this
  similarity(embedding1: Array<number>, embedding2: Array<number>): number {
    return faceres.similarity(embedding1, embedding2);
  }

  /**
   * Segmentation method takes any input and returns processed canvas with body segmentation
   * Optional parameter background is used to fill the background with specific input
   * Segmentation is not triggered as part of detect process
   *
   * @param input: {@link Input}
   * @param background?: {@link Input}
   * @returns Canvas
   */
  segmentation(input: Input, background?: Input) {
    return segmentation.process(input, background, this.config);
  }

  /** Enhance method performs additional enhacements to face image previously detected for futher processing
   * @param input: Tensor as provided in human.result.face[n].tensor
   * @returns Tensor
   */
  // eslint-disable-next-line class-methods-use-this
  enhance(input: Tensor): Tensor | null {
    // @ts-ignore type mismach for Tensor
    return faceres.enhance(input);
  }

  /** Math method find best match between provided face descriptor and predefined database of known descriptors
   * @param faceEmbedding: face descriptor previsouly calculated on any face
   * @param db: array of mapping of face descriptors to known values
   * @param threshold: minimum score for matching to be considered in the result
   * @returns best match
   */
  // eslint-disable-next-line class-methods-use-this
  match(faceEmbedding: Array<number>, db: Array<{ name: string, source: string, embedding: number[] }>, threshold = 0): { name: string, source: string, similarity: number, embedding: number[] } {
    return faceres.match(faceEmbedding, db, threshold);
  }

  /** Load method preloads all configured models on-demand
   * - Not explicitly required as any required model is load implicitly on it's first run
   * @param userConfig?: {@link Config}
  */
  async load(userConfig?: Config | Record<string, unknown>) {
    this.state = 'load';
    const timeStamp = now();
    if (userConfig) this.config = mergeDeep(this.config, userConfig) as Config;

    if (this.#firstRun) { // print version info on first run and check for correct backend setup
      if (this.config.debug) log(`version: ${this.version}`);
      if (this.config.debug) log(`tfjs version: ${this.tf.version_core}`);
      if (this.config.debug) log('platform:', this.sysinfo.platform);
      if (this.config.debug) log('agent:', this.sysinfo.agent);

      await this.#checkBackend(true);
      if (this.tf.ENV.flags.IS_BROWSER) {
        if (this.config.debug) log('configuration:', this.config);
        if (this.config.debug) log('tf flags:', this.tf.ENV.flags);
      }
    }

    await models.load(this); // actually loads models

    if (this.#firstRun) { // print memory stats on first run
      if (this.config.debug) log('tf engine state:', this.tf.engine().state.numBytes, 'bytes', this.tf.engine().state.numTensors, 'tensors');
      this.#firstRun = false;
    }

    const current = Math.trunc(now() - timeStamp);
    if (current > (this.performance.load as number || 0)) this.performance.load = current;
  }

  // check if backend needs initialization if it changed
  /** @hidden */
  #checkBackend = async (force = false) => {
    if (this.config.backend && (this.config.backend.length > 0) && force || (this.tf.getBackend() !== this.config.backend)) {
      const timeStamp = now();
      this.state = 'backend';
      /* force backend reload
      if (this.config.backend in tf.engine().registry) {
        const backendFactory = tf.findBackendFactory(this.config.backend);
        tf.removeBackend(this.config.backend);
        tf.registerBackend(this.config.backend, backendFactory);
      } else {
        log('Backend not registred:', this.config.backend);
      }
      */

      if (this.config.backend && this.config.backend.length > 0) {
        // @ts-ignore ignore missing type for WorkerGlobalScope as that is the point
        if (typeof window === 'undefined' && typeof WorkerGlobalScope !== 'undefined' && this.config.debug) log('running inside web worker');

        // force browser vs node backend
        if (this.tf.ENV.flags.IS_BROWSER && this.config.backend === 'tensorflow') this.config.backend = 'webgl';
        if (this.tf.ENV.flags.IS_NODE && (this.config.backend === 'webgl' || this.config.backend === 'humangl')) this.config.backend = 'tensorflow';

        if (this.config.debug) log('setting backend:', this.config.backend);

        if (this.config.backend === 'wasm') {
          if (this.config.debug) log('wasm path:', this.config.wasmPath);
          if (typeof this.tf?.setWasmPaths !== 'undefined') this.tf.setWasmPaths(this.config.wasmPath);
          else throw new Error('Human: WASM backend is not loaded');
          const simd = await this.tf.env().getAsync('WASM_HAS_SIMD_SUPPORT');
          const mt = await this.tf.env().getAsync('WASM_HAS_MULTITHREAD_SUPPORT');
          if (this.config.debug) log(`wasm execution: ${simd ? 'SIMD' : 'no SIMD'} ${mt ? 'multithreaded' : 'singlethreaded'}`);
          if (this.config.debug && !simd) log('warning: wasm simd support is not enabled');
        }

        if (this.config.backend === 'humangl') backend.register();
        try {
          await this.tf.setBackend(this.config.backend);
        } catch (err) {
          log('error: cannot set backend:', this.config.backend, err);
        }
      }
      this.tf.enableProdMode();
      // this.tf.enableDebugMode();
      if (this.tf.getBackend() === 'webgl' || this.tf.getBackend() === 'humangl') {
        this.tf.ENV.set('CHECK_COMPUTATION_FOR_ERRORS', false);
        this.tf.ENV.set('WEBGL_CPU_FORWARD', true);
        this.tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', true);
        // if (!this.config.object.enabled) this.tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true); // safe to use 16bit precision
        if (typeof this.config['deallocate'] !== 'undefined' && this.config['deallocate']) { // hidden param
          log('changing webgl: WEBGL_DELETE_TEXTURE_THRESHOLD:', true);
          this.tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
        }
        const gl = await this.tf.backend().getGPGPUContext().gl;
        if (this.config.debug) log(`gl version:${gl.getParameter(gl.VERSION)} renderer:${gl.getParameter(gl.RENDERER)}`);
      }
      await this.tf.ready();
      this.performance.backend = Math.trunc(now() - timeStamp);
    }
  }

  /**
   * Runs interpolation using last known result and returns smoothened result
   * Interpolation is based on time since last known result so can be called independently
   *
   * @param result?: {@link Result} optional use specific result set to run interpolation on
   * @returns result: {@link Result}
   */
  next = (result?: Result) => interpolate.calc(result || this.result) as Result;

  // check if input changed sufficiently to trigger new detections
  /** @hidden */
  #skipFrame = async (input) => {
    if (this.config.cacheSensitivity === 0) return false;
    const resizeFact = 32;
    const reduced: Tensor = input.resizeBilinear([Math.trunc(input.shape[1] / resizeFact), Math.trunc(input.shape[2] / resizeFact)]);
    // use tensor sum
    /*
    const sumT = this.tf.sum(reduced);
    const sum = sumT.dataSync()[0] as number;
    sumT.dispose();
    */
    // use js loop sum, faster than uploading tensor to gpu calculating and downloading back
    const reducedData = reduced.dataSync(); // raw image rgb array
    let sum = 0;
    for (let i = 0; i < reducedData.length / 3; i++) sum += reducedData[3 * i + 2]; // look only at green value of each pixel

    reduced.dispose();
    const diff = 100 * (Math.max(sum, this.#lastInputSum) / Math.min(sum, this.#lastInputSum) - 1);
    this.#lastInputSum = sum;
    // if previous frame was skipped, skip this frame if changed more than cacheSensitivity
    // if previous frame was not skipped, then look for cacheSensitivity or difference larger than one in previous frame to avoid resetting cache in subsequent frames unnecessarily
    const skipFrame = diff < Math.max(this.config.cacheSensitivity, this.#lastCacheDiff);
    // if difference is above 10x threshold, don't use last value to force reset cache for significant change of scenes or images
    this.#lastCacheDiff = diff > 10 * this.config.cacheSensitivity ? 0 : diff;
    return skipFrame;
  }

  /** Main detection method
   * - Analyze configuration: {@link Config}
   * - Pre-process input: {@link Input}
   * - Run inference for all configured models
   * - Process and return result: {@link Result}
   *
   * @param input: Input
   * @param userConfig?: {@link Config}
   * @returns result: {@link Result}
  */
  async detect(input: Input, userConfig?: Config | Record<string, unknown>): Promise<Result | Error> {
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

      // configure backend
      await this.#checkBackend();

      // load models if enabled
      await this.load();

      /*
      // function disabled in favor of inputChanged
      // disable video optimization for inputs of type image, but skip if inside worker thread
      let previousVideoOptimized;
      // @ts-ignore ignore missing type for WorkerGlobalScope as that is the point
      if (input && this.config.videoOptimized && (typeof window !== 'undefined') && (typeof WorkerGlobalScope !== 'undefined') && (
        (typeof HTMLImageElement !== 'undefined' && input instanceof HTMLImageElement)
        || (typeof Image !== 'undefined' && input instanceof Image)
        || (typeof ImageData !== 'undefined' && input instanceof ImageData)
        || (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap))
      ) {
        log('disabling video optimization');
        previousVideoOptimized = this.config.videoOptimized;
        this.config.videoOptimized = false;
      }
      */

      timeStamp = now();
      let process = image.process(input, this.config);
      this.performance.image = Math.trunc(now() - timeStamp);
      this.analyze('Get Image:');

      // run segmentation preprocessing
      if (this.config.segmentation.enabled && process && process.tensor) {
        this.analyze('Start Segmentation:');
        this.state = 'run:segmentation';
        timeStamp = now();
        await segmentation.predict(process);
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.segmentation = elapsedTime;
        if (process.canvas) {
          // replace input
          process.tensor.dispose();
          process = image.process(process.canvas, this.config);
        }
        this.analyze('End Segmentation:');
      }

      if (!process || !process.tensor) {
        log('could not convert input to tensor');
        resolve({ error: 'could not convert input to tensor' });
        return;
      }

      timeStamp = now();
      this.config.skipFrame = await this.#skipFrame(process.tensor);
      if (!this.performance.frames) this.performance.frames = 0;
      if (!this.performance.cached) this.performance.cached = 0;
      (this.performance.frames as number)++;
      if (this.config.skipFrame) this.performance.cached++;
      this.performance.changed = Math.trunc(now() - timeStamp);
      this.analyze('Check Changed:');

      // prepare where to store model results
      // keep them with weak typing as it can be promise or not
      let faceRes;
      let bodyRes;
      let handRes;
      let objectRes;

      // run face detection followed by all models that rely on face bounding box: face mesh, age, gender, emotion
      if (this.config.async) {
        faceRes = this.config.face.enabled ? face.detectFace(this, process.tensor) : [];
        if (this.performance.face) delete this.performance.face;
      } else {
        this.state = 'run:face';
        timeStamp = now();
        faceRes = this.config.face.enabled ? await face.detectFace(this, process.tensor) : [];
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.face = elapsedTime;
      }

      // run body: can be posenet, blazepose, efficientpose, movenet
      this.analyze('Start Body:');
      if (this.config.async) {
        if (this.config.body.modelPath.includes('posenet')) bodyRes = this.config.body.enabled ? posenet.predict(process.tensor, this.config) : [];
        else if (this.config.body.modelPath.includes('blazepose')) bodyRes = this.config.body.enabled ? blazepose.predict(process.tensor, this.config) : [];
        else if (this.config.body.modelPath.includes('efficientpose')) bodyRes = this.config.body.enabled ? efficientpose.predict(process.tensor, this.config) : [];
        else if (this.config.body.modelPath.includes('movenet')) bodyRes = this.config.body.enabled ? movenet.predict(process.tensor, this.config) : [];
        if (this.performance.body) delete this.performance.body;
      } else {
        this.state = 'run:body';
        timeStamp = now();
        if (this.config.body.modelPath.includes('posenet')) bodyRes = this.config.body.enabled ? await posenet.predict(process.tensor, this.config) : [];
        else if (this.config.body.modelPath.includes('blazepose')) bodyRes = this.config.body.enabled ? await blazepose.predict(process.tensor, this.config) : [];
        else if (this.config.body.modelPath.includes('efficientpose')) bodyRes = this.config.body.enabled ? await efficientpose.predict(process.tensor, this.config) : [];
        else if (this.config.body.modelPath.includes('movenet')) bodyRes = this.config.body.enabled ? await movenet.predict(process.tensor, this.config) : [];
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.body = elapsedTime;
      }
      this.analyze('End Body:');

      // run handpose
      this.analyze('Start Hand:');
      if (this.config.async) {
        handRes = this.config.hand.enabled ? handpose.predict(process.tensor, this.config) : [];
        if (this.performance.hand) delete this.performance.hand;
      } else {
        this.state = 'run:hand';
        timeStamp = now();
        handRes = this.config.hand.enabled ? await handpose.predict(process.tensor, this.config) : [];
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.hand = elapsedTime;
      }
      this.analyze('End Hand:');

      // run nanodet
      this.analyze('Start Object:');
      if (this.config.async) {
        if (this.config.object.modelPath.includes('nanodet')) objectRes = this.config.object.enabled ? nanodet.predict(process.tensor, this.config) : [];
        else if (this.config.object.modelPath.includes('centernet')) objectRes = this.config.object.enabled ? centernet.predict(process.tensor, this.config) : [];
        if (this.performance.object) delete this.performance.object;
      } else {
        this.state = 'run:object';
        timeStamp = now();
        if (this.config.object.modelPath.includes('nanodet')) objectRes = this.config.object.enabled ? await nanodet.predict(process.tensor, this.config) : [];
        else if (this.config.object.modelPath.includes('centernet')) objectRes = this.config.object.enabled ? await centernet.predict(process.tensor, this.config) : [];
        elapsedTime = Math.trunc(now() - timeStamp);
        if (elapsedTime > 0) this.performance.object = elapsedTime;
      }
      this.analyze('End Object:');

      // if async wait for results
      if (this.config.async) [faceRes, bodyRes, handRes, objectRes] = await Promise.all([faceRes, bodyRes, handRes, objectRes]);

      // run gesture analysis last
      let gestureRes: Gesture[] = [];
      if (this.config.gesture.enabled) {
        timeStamp = now();
        gestureRes = [...gesture.face(faceRes), ...gesture.body(bodyRes), ...gesture.hand(handRes), ...gesture.iris(faceRes)];
        if (!this.config.async) this.performance.gesture = Math.trunc(now() - timeStamp);
        else if (this.performance.gesture) delete this.performance.gesture;
      }

      this.performance.total = Math.trunc(now() - timeStart);
      this.state = 'idle';
      this.result = {
        face: faceRes,
        body: bodyRes,
        hand: handRes,
        gesture: gestureRes,
        object: objectRes,
        performance: this.performance,
        canvas: process.canvas,
        timestamp: Date.now(),
        get persons() { return persons.join(faceRes, bodyRes, handRes, gestureRes, process?.tensor?.shape); },
      };

      // finally dispose input tensor
      tf.dispose(process.tensor);

      // log('Result:', result);
      resolve(this.result);
    });
  }

  /** @hidden */
  #warmupBitmap = async () => {
    const b64toBlob = (base64, type = 'application/octet-stream') => fetch(`data:${type};base64,${base64}`).then((res) => res.blob());
    let blob;
    let res;
    switch (this.config.warmup) {
      case 'face': blob = await b64toBlob(sample.face); break;
      case 'full': blob = await b64toBlob(sample.body); break;
      default: blob = null;
    }
    if (blob) {
      const bitmap = await createImageBitmap(blob);
      res = await this.detect(bitmap, this.config);
      bitmap.close();
    }
    return res;
  }

  /** @hidden */
  #warmupCanvas = async () => new Promise((resolve) => {
    let src;
    let size = 0;
    switch (this.config.warmup) {
      case 'face':
        size = 256;
        src = 'data:image/jpeg;base64,' + sample.face;
        break;
      case 'full':
      case 'body':
        size = 1200;
        src = 'data:image/jpeg;base64,' + sample.body;
        break;
      default:
        src = null;
    }
    // src = encodeURI('../assets/human-sample-upper.jpg');
    const img = new Image();
    img.onload = async () => {
      const canvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(size, size) : document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      // const data = ctx?.getImageData(0, 0, canvas.height, canvas.width);
      const res = await this.detect(canvas, this.config);
      resolve(res);
    };
    if (src) img.src = src;
    else resolve(null);
  });

  /** @hidden */
  #warmupNode = async () => {
    const atob = (str) => Buffer.from(str, 'base64');
    let img;
    if (this.config.warmup === 'face') img = atob(sample.face);
    if (this.config.warmup === 'body' || this.config.warmup === 'full') img = atob(sample.body);
    if (!img) return null;
    let res;
    if (typeof tf['node'] !== 'undefined') {
      const data = tf['node'].decodeJpeg(img);
      const expanded = data.expandDims(0);
      this.tf.dispose(data);
      // log('Input:', expanded);
      res = await this.detect(expanded, this.config);
      this.tf.dispose(expanded);
    } else {
      if (this.config.debug) log('Warmup tfjs-node not loaded');
      /*
      const input = await canvasJS.loadImage(img);
      const canvas = canvasJS.createCanvas(input.width, input.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, input.width, input.height);
      res = await this.detect(input, this.config);
      */
    }
    return res;
  }

  /** Warmup method pre-initializes all configured models for faster inference
   * - can take significant time on startup
   * - only used for `webgl` and `humangl` backends
   * @param userConfig?: Config
  */
  async warmup(userConfig?: Config | Record<string, unknown>): Promise<Result | { error }> {
    const t0 = now();
    if (userConfig) this.config = mergeDeep(this.config, userConfig) as Config;
    if (!this.config.warmup || this.config.warmup === 'none') return { error: 'null' };
    let res;
    if (typeof createImageBitmap === 'function') res = await this.#warmupBitmap();
    else if (typeof Image !== 'undefined') res = await this.#warmupCanvas();
    else res = await this.#warmupNode();
    const t1 = now();
    if (this.config.debug) log('Warmup', this.config.warmup, Math.round(t1 - t0), 'ms', res);
    return res;
  }
}

/**
 * Class Human is also available as default export
 */
export { Human as default };
