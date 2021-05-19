import { log, now, mergeDeep } from './helpers';
import { Config, defaults } from './config';
import { Result } from './result';
import * as sysinfo from './sysinfo';
import * as tf from '../dist/tfjs.esm.js';
import * as backend from './tfjs/backend';
import * as face from './face';
import * as facemesh from './blazeface/facemesh';
import * as faceres from './faceres/faceres';
import * as emotion from './emotion/emotion';
import * as posenet from './posenet/posenet';
import * as handpose from './handpose/handpose';
import * as blazepose from './blazepose/blazepose';
import * as nanodet from './object/nanodet';
import * as centernet from './object/centernet';
import * as gesture from './gesture/gesture';
import * as image from './image/image';
import * as draw from './draw/draw';
import * as sample from './sample';
import * as app from '../package.json';

/** Generic Tensor object type */
export type Tensor = typeof tf.Tensor;

export type { Config } from './config';
export type { Result } from './result';
export type { DrawOptions } from './draw/draw';

/** Defines all possible input types for **Human** detection */
export type Input = Tensor | typeof Image | ImageData | ImageBitmap | HTMLImageElement | HTMLMediaElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;

/** Error message */
export type Error = { error: string };

/** Instance of TensorFlow/JS */
export type TensorFlow = typeof tf;

/** Generic Model object type, holds instance of individual models */
type Model = Object;

/**
 * **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 */
export class Human {
  /** Current version of Human library in semver format */
  version: string;
  /** Current configuration
   * - Details: {@link Config}
   */
  config: Config;
  /** Current state of Human library
   * - Can be polled to determine operations that are currently executed
   */
  state: string;
  /** Internal: Instance of current image being processed */
  image: { tensor: Tensor | null, canvas: OffscreenCanvas | HTMLCanvasElement | null };
  /** Internal: Instance of TensorFlow/JS used by Human
   * - Can be embedded or externally provided
   */
  tf: TensorFlow;
  /** Draw helper classes that can draw detected objects on canvas using specified draw styles
   * - options: global settings for all draw operations, can be overriden for each draw method, for details see {@link DrawOptions}
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
  /** Internal: Currently loaded models */
  models: {
    face: [Model, Model, Model] | null,
    posenet: Model | null,
    blazepose: Model | null,
    efficientpose: Model | null,
    handpose: [Model, Model] | null,
    iris: Model | null,
    age: Model | null,
    gender: Model | null,
    emotion: Model | null,
    embedding: Model | null,
    nanodet: Model | null,
    centernet: Model | null,
    faceres: Model | null,
  };
  /** Internal: Currently loaded classes */
  classes: {
    facemesh: typeof facemesh;
    emotion: typeof emotion;
    body: typeof posenet | typeof blazepose;
    hand: typeof handpose;
    nanodet: typeof nanodet;
    centernet: typeof centernet;
    faceres: typeof faceres;
  };
  /** Face triangualtion array of 468 points, used for triangle references between points */
  faceTriangulation: typeof facemesh.triangulation;
  /** UV map of 468 values, used for 3D mapping of the face mesh */
  faceUVMap: typeof facemesh.uvmap;
  /** Platform and agent information detected by Human */
  sysinfo: { platform: string, agent: string };
  /** Performance object that contains values for all recently performed operations */
  perf: any;
  #numTensors: number;
  #analyzeMemoryLeaks: boolean;
  #checkSanity: boolean;
  #firstRun: boolean;
  #lastInputSum: number

  // definition end

  /**
   * Creates instance of Human library that is futher used for all operations
   * - @param userConfig: {@link Config}
   */
  constructor(userConfig: Config | Object = {}) {
    this.tf = tf;
    this.draw = draw;
    this.version = app.version;
    this.config = mergeDeep(defaults, userConfig);
    this.state = 'idle';
    this.#numTensors = 0;
    this.#analyzeMemoryLeaks = false;
    this.#checkSanity = false;
    this.#firstRun = true;
    this.perf = {};
    // object that contains all initialized models
    this.models = {
      face: null,
      posenet: null,
      blazepose: null,
      efficientpose: null,
      handpose: null,
      iris: null,
      age: null,
      gender: null,
      emotion: null,
      embedding: null,
      nanodet: null,
      centernet: null,
      faceres: null,
    };
    // export access to image processing
    // @ts-ignore eslint-typescript cannot correctly infer type in anonymous function
    this.image = (input: Input) => image.process(input, this.config);
    // export raw access to underlying models
    this.classes = {
      facemesh,
      emotion,
      faceres,
      body: this.config.body.modelPath.includes('posenet') ? posenet : blazepose,
      hand: handpose,
      nanodet,
      centernet,
    };
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
    const current = this.tf.engine().state.numTensors;
    const previous = this.#numTensors;
    this.#numTensors = current;
    const leaked = current - previous;
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
  */
  // eslint-disable-next-line class-methods-use-this
  similarity(embedding1: Array<number>, embedding2: Array<number>): number {
    return faceres.similarity(embedding1, embedding2);
  }

  /** Enhance method performs additional enhacements to face image previously detected for futher processing
   * @param input Tensor as provided in human.result.face[n].tensor
   * @returns Tensor
   */
  // eslint-disable-next-line class-methods-use-this
  enhance(input: Tensor): Tensor | null {
    return faceres.enhance(input);
  }

  /**
   * Math method find best match between provided face descriptor and predefined database of known descriptors
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
  */
  async load(userConfig: Config | Object = {}) {
    this.state = 'load';
    const timeStamp = now();
    if (userConfig) this.config = mergeDeep(this.config, userConfig);

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
    if (this.config.async) { // load models concurrently
      [
        this.models.face,
        this.models.emotion,
        this.models.handpose,
        this.models.posenet,
        this.models.blazepose,
        this.models.nanodet,
        this.models.centernet,
        this.models.faceres,
      ] = await Promise.all([
        this.models.face || (this.config.face.enabled ? facemesh.load(this.config) : null),
        this.models.emotion || ((this.config.face.enabled && this.config.face.emotion.enabled) ? emotion.load(this.config) : null),
        this.models.handpose || (this.config.hand.enabled ? handpose.load(this.config) : null),
        this.models.posenet || (this.config.body.enabled && this.config.body.modelPath.includes('posenet') ? posenet.load(this.config) : null),
        this.models.blazepose || (this.config.body.enabled && this.config.body.modelPath.includes('blazepose') ? blazepose.load(this.config) : null),
        this.models.nanodet || (this.config.object.enabled && this.config.object.modelPath.includes('nanodet') ? nanodet.load(this.config) : null),
        this.models.centernet || (this.config.object.enabled && this.config.object.modelPath.includes('centernet') ? centernet.load(this.config) : null),
        this.models.faceres || ((this.config.face.enabled && this.config.face.description.enabled) ? faceres.load(this.config) : null),
      ]);
    } else { // load models sequentially
      if (this.config.face.enabled && !this.models.face) this.models.face = await facemesh.load(this.config);
      if (this.config.face.enabled && this.config.face.emotion.enabled && !this.models.emotion) this.models.emotion = await emotion.load(this.config);
      if (this.config.hand.enabled && !this.models.handpose) this.models.handpose = await handpose.load(this.config);
      if (this.config.body.enabled && !this.models.posenet && this.config.body.modelPath.includes('posenet')) this.models.posenet = await posenet.load(this.config);
      if (this.config.body.enabled && !this.models.blazepose && this.config.body.modelPath.includes('blazepose')) this.models.blazepose = await blazepose.load(this.config);
      if (this.config.object.enabled && !this.models.nanodet && this.config.object.modelPath.includes('nanodet')) this.models.nanodet = await nanodet.load(this.config);
      if (this.config.object.enabled && !this.models.centernet && this.config.object.modelPath.includes('centernet')) this.models.centernet = await centernet.load(this.config);
      if (this.config.face.enabled && this.config.face.description.enabled && !this.models.faceres) this.models.faceres = await faceres.load(this.config);
    }

    if (this.#firstRun) { // print memory stats on first run
      if (this.config.debug) log('tf engine state:', this.tf.engine().state.numBytes, 'bytes', this.tf.engine().state.numTensors, 'tensors');
      this.#firstRun = false;
    }

    const current = Math.trunc(now() - timeStamp);
    if (current > (this.perf.load || 0)) this.perf.load = current;
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
        this.tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', true);
        if (typeof this.config['deallocate'] !== 'undefined') {
          log('changing webgl: WEBGL_DELETE_TEXTURE_THRESHOLD:', true);
          this.tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
        }
        const gl = await this.tf.backend().getGPGPUContext().gl;
        if (this.config.debug) log(`gl version:${gl.getParameter(gl.VERSION)} renderer:${gl.getParameter(gl.RENDERER)}`);
      }
      await this.tf.ready();
      this.perf.backend = Math.trunc(now() - timeStamp);
    }
  }

  // check if input changed sufficiently to trigger new detections
  /** @hidden */
  #skipFrame = async (input) => {
    if (this.config.cacheSensitivity === 0) return false;
    const resizeFact = 50;
    const reduced = input.resizeBilinear([Math.trunc(input.shape[1] / resizeFact), Math.trunc(input.shape[2] / resizeFact)]);
    const sumT = this.tf.sum(reduced);
    reduced.dispose();
    const sum = sumT.dataSync()[0] as number;
    sumT.dispose();
    const diff = Math.max(sum, this.#lastInputSum) / Math.min(sum, this.#lastInputSum) - 1;
    this.#lastInputSum = sum;
    return diff < this.config.cacheSensitivity;
  }

  /** Main detection method
   * - Analyze configuration: {@link Config}
   * - Pre-process input: {@link Input}
   * - Run inference for all configured models
   * - Process and return result: {@link Result}
  */
  async detect(input: Input, userConfig: Config | Object = {}): Promise<Result | Error> {
    // detection happens inside a promise
    return new Promise(async (resolve) => {
      this.state = 'config';
      let timeStamp;

      // update configuration
      this.config = mergeDeep(this.config, userConfig);

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
      const process = image.process(input, this.config);
      if (!process || !process.tensor) {
        log('could not convert input to tensor');
        resolve({ error: 'could not convert input to tensor' });
        return;
      }
      this.perf.image = Math.trunc(now() - timeStamp);
      this.analyze('Get Image:');

      timeStamp = now();
      // @ts-ignore hidden dynamic property that is not part of definitions
      this.config.skipFrame = await this.#skipFrame(process.tensor);
      if (!this.perf.frames) this.perf.frames = 0;
      if (!this.perf.cached) this.perf.cached = 0;
      this.perf.frames++;
      // @ts-ignore hidden dynamic property that is not part of definitions
      if (this.config.skipFrame) this.perf.cached++;
      this.perf.changed = Math.trunc(now() - timeStamp);
      this.analyze('Check Changed:');

      // prepare where to store model results
      let bodyRes;
      let handRes;
      let faceRes;
      let objectRes;
      let current;

      // run face detection followed by all models that rely on face bounding box: face mesh, age, gender, emotion
      if (this.config.async) {
        faceRes = this.config.face.enabled ? face.detectFace(this, process.tensor) : [];
        if (this.perf.face) delete this.perf.face;
      } else {
        this.state = 'run:face';
        timeStamp = now();
        faceRes = this.config.face.enabled ? await face.detectFace(this, process.tensor) : [];
        current = Math.trunc(now() - timeStamp);
        if (current > 0) this.perf.face = current;
      }

      // run body: can be posenet or blazepose
      this.analyze('Start Body:');
      if (this.config.async) {
        if (this.config.body.modelPath.includes('posenet')) bodyRes = this.config.body.enabled ? posenet.predict(process.tensor, this.config) : [];
        else if (this.config.body.modelPath.includes('blazepose')) bodyRes = this.config.body.enabled ? blazepose.predict(process.tensor, this.config) : [];
        if (this.perf.body) delete this.perf.body;
      } else {
        this.state = 'run:body';
        timeStamp = now();
        if (this.config.body.modelPath.includes('posenet')) bodyRes = this.config.body.enabled ? await posenet.predict(process.tensor, this.config) : [];
        else if (this.config.body.modelPath.includes('blazepose')) bodyRes = this.config.body.enabled ? await blazepose.predict(process.tensor, this.config) : [];
        current = Math.trunc(now() - timeStamp);
        if (current > 0) this.perf.body = current;
      }
      this.analyze('End Body:');

      // run handpose
      this.analyze('Start Hand:');
      if (this.config.async) {
        handRes = this.config.hand.enabled ? handpose.predict(process.tensor, this.config) : [];
        if (this.perf.hand) delete this.perf.hand;
      } else {
        this.state = 'run:hand';
        timeStamp = now();
        handRes = this.config.hand.enabled ? await handpose.predict(process.tensor, this.config) : [];
        current = Math.trunc(now() - timeStamp);
        if (current > 0) this.perf.hand = current;
      }
      this.analyze('End Hand:');

      // run nanodet
      this.analyze('Start Object:');
      if (this.config.async) {
        if (this.config.object.modelPath.includes('nanodet')) objectRes = this.config.object.enabled ? nanodet.predict(process.tensor, this.config) : [];
        else if (this.config.object.modelPath.includes('centernet')) objectRes = this.config.object.enabled ? centernet.predict(process.tensor, this.config) : [];
        if (this.perf.object) delete this.perf.object;
      } else {
        this.state = 'run:object';
        timeStamp = now();
        if (this.config.object.modelPath.includes('nanodet')) objectRes = this.config.object.enabled ? await nanodet.predict(process.tensor, this.config) : [];
        else if (this.config.object.modelPath.includes('centernet')) objectRes = this.config.object.enabled ? await centernet.predict(process.tensor, this.config) : [];
        current = Math.trunc(now() - timeStamp);
        if (current > 0) this.perf.object = current;
      }
      this.analyze('End Object:');

      // if async wait for results
      if (this.config.async) {
        [faceRes, bodyRes, handRes, objectRes] = await Promise.all([faceRes, bodyRes, handRes, objectRes]);
      }
      tf.dispose(process.tensor);

      // run gesture analysis last
      let gestureRes: any[] = [];
      if (this.config.gesture.enabled) {
        timeStamp = now();
        gestureRes = [...gesture.face(faceRes), ...gesture.body(bodyRes), ...gesture.hand(handRes), ...gesture.iris(faceRes)];
        if (!this.config.async) this.perf.gesture = Math.trunc(now() - timeStamp);
        else if (this.perf.gesture) delete this.perf.gesture;
      }

      this.perf.total = Math.trunc(now() - timeStart);
      this.state = 'idle';
      const result = {
        face: faceRes,
        body: bodyRes,
        hand: handRes,
        gesture: gestureRes,
        object: objectRes,
        performance: this.perf,
        canvas: process.canvas,
      };
      // log('Result:', result);
      resolve(result);
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

  /** Warmup metho pre-initializes all models for faster inference
   * - can take significant time on startup
   * - only used for `webgl` and `humangl` backends
  */
  async warmup(userConfig: Config | Object = {}): Promise<Result | { error }> {
    const t0 = now();
    if (userConfig) this.config = mergeDeep(this.config, userConfig);
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
