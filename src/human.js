import { log } from './log.js';
import * as tf from '../dist/tfjs.esm.js';
import * as backend from './tfjs/backend.js';
import * as facemesh from './blazeface/facemesh.js';
import * as age from './age/age.js';
import * as gender from './gender/gender.js';
import * as emotion from './emotion/emotion.js';
import * as embedding from './embedding/embedding.js';
import * as posenet from './posenet/posenet.js';
import * as handpose from './handpose/handpose.js';
import * as gesture from './gesture/gesture.js';
import * as image from './image.js';
import * as profile from './profile.js';
import * as config from '../config.js';
import * as sample from './sample.js';
import * as app from '../package.json';

// helper function: gets elapsed time on both browser and nodejs
const now = () => {
  if (typeof performance !== 'undefined') return performance.now();
  return parseInt(Number(process.hrtime.bigint()) / 1000 / 1000);
};

// helper function: perform deep merge of multiple objects so it allows full inheriance with overrides
function mergeDeep(...objects) {
  const isObject = (obj) => obj && typeof obj === 'object';
  return objects.reduce((prev, obj) => {
    Object.keys(obj || {}).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });
    return prev;
  }, {});
}

class Human {
  constructor(userConfig = {}) {
    this.tf = tf;
    this.version = app.version;
    this.config = mergeDeep(config.default, userConfig);
    this.fx = null;
    this.state = 'idle';
    this.numTensors = 0;
    this.analyzeMemoryLeaks = false;
    this.checkSanity = false;
    this.firstRun = true;
    this.perf = {};
    // object that contains all initialized models
    this.models = {
      facemesh: null,
      posenet: null,
      handpose: null,
      iris: null,
      age: null,
      gender: null,
      emotion: null,
    };
    // export raw access to underlying models
    this.facemesh = facemesh;
    this.age = age;
    this.gender = gender;
    this.emotion = emotion;
    this.body = posenet;
    this.hand = handpose;
  }

  profile() {
    if (this.config.profile) return profile.data;
    return {};
  }

  // helper function: measure tensor leak
  analyze(...msg) {
    if (!this.analyzeMemoryLeaks) return;
    const current = tf.engine().state.numTensors;
    const previous = this.numTensors;
    this.numTensors = current;
    const leaked = current - previous;
    if (leaked !== 0) log(...msg, leaked);
  }

  // quick sanity check on inputs
  sanity(input) {
    if (!this.checkSanity) return null;
    if (!input) return 'input is not defined';
    if (tf.ENV.flags.IS_NODE && !(input instanceof tf.Tensor)) {
      return 'input must be a tensor';
    }
    try {
      tf.getBackend();
    } catch {
      return 'backend not loaded';
    }
    return null;
  }

  simmilarity(embedding1, embedding2) {
    if (this.config.face.embedding.enabled) return embedding.simmilarity(embedding1, embedding2);
    return 0;
  }

  // preload models, not explicitly required as it's done automatically on first use
  async load(userConfig) {
    this.state = 'load';
    const timeStamp = now();
    if (userConfig) this.config = mergeDeep(this.config, userConfig);

    if (this.firstRun) {
      log(`version: ${this.version} TensorFlow/JS version: ${tf.version_core}`);
      await this.checkBackend(true);
      if (tf.ENV.flags.IS_BROWSER) {
        log('configuration:', this.config);
        log('tf flags:', tf.ENV.flags);
      }
    }

    if (this.config.async) {
      [
        this.models.facemesh,
        this.models.age,
        this.models.gender,
        this.models.emotion,
        this.models.embedding,
        this.models.posenet,
        this.models.handpose,
      ] = await Promise.all([
        this.models.facemesh || (this.config.face.enabled ? facemesh.load(this.config) : null),
        this.models.age || ((this.config.face.enabled && this.config.face.age.enabled) ? age.load(this.config) : null),
        this.models.gender || ((this.config.face.enabled && this.config.face.gender.enabled) ? gender.load(this.config) : null),
        this.models.emotion || ((this.config.face.enabled && this.config.face.emotion.enabled) ? emotion.load(this.config) : null),
        this.models.embedding || ((this.config.face.enabled && this.config.face.embedding.enabled) ? embedding.load(this.config) : null),
        this.models.posenet || (this.config.body.enabled ? posenet.load(this.config) : null),
        this.models.handpose || (this.config.hand.enabled ? handpose.load(this.config) : null),
      ]);
    } else {
      if (this.config.face.enabled && !this.models.facemesh) this.models.facemesh = await facemesh.load(this.config);
      if (this.config.face.enabled && this.config.face.age.enabled && !this.models.age) this.models.age = await age.load(this.config);
      if (this.config.face.enabled && this.config.face.gender.enabled && !this.models.gender) this.models.gender = await gender.load(this.config);
      if (this.config.face.enabled && this.config.face.emotion.enabled && !this.models.emotion) this.models.emotion = await emotion.load(this.config);
      if (this.config.face.enabled && this.config.face.embedding.enabled && !this.models.embedding) this.models.embedding = await embedding.load(this.config);
      if (this.config.body.enabled && !this.models.posenet) this.models.posenet = await posenet.load(this.config);
      if (this.config.hand.enabled && !this.models.handpose) this.models.handpose = await handpose.load(this.config);
    }

    if (this.firstRun) {
      log('tf engine state:', tf.engine().state.numBytes, 'bytes', tf.engine().state.numTensors, 'tensors');
      this.firstRun = false;
    }

    const current = Math.trunc(now() - timeStamp);
    if (current > (this.perf.load || 0)) this.perf.load = current;
  }

  // check if backend needs initialization if it changed
  async checkBackend(force) {
    if (this.config.backend && (this.config.backend !== '') && force || (tf.getBackend() !== this.config.backend)) {
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

      log('setting backend:', this.config.backend);

      if (this.config.backend === 'wasm') {
        log('settings wasm path:', this.config.wasmPath);
        tf.setWasmPaths(this.config.wasmPath);
        const simd = await tf.env().getAsync('WASM_HAS_SIMD_SUPPORT');
        if (!simd) log('warning: wasm simd support is not enabled');
      }

      if (this.config.backend === 'humangl') backend.register();
      try {
        await tf.setBackend(this.config.backend);
      } catch (err) {
        log('error: cannot set backend:', this.config.backend, err);
      }
      tf.enableProdMode();
      /* debug mode is really too mcuh
      tf.enableDebugMode();
      */
      if (tf.getBackend() === 'webgl') {
        if (this.config.deallocate) {
          log('changing webgl: WEBGL_DELETE_TEXTURE_THRESHOLD:', this.config.deallocate);
          tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', this.config.deallocate ? 0 : -1);
        }
        tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true);
        tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', true);
        const gl = await tf.backend().getGPGPUContext().gl;
        log(`gl version:${gl.getParameter(gl.VERSION)} renderer:${gl.getParameter(gl.RENDERER)}`);
      }
      await tf.ready();
      this.perf.backend = Math.trunc(now() - timeStamp);
    }
  }

  async detectFace(input) {
    // run facemesh, includes blazeface and iris
    // eslint-disable-next-line no-async-promise-executor
    let timeStamp;
    let ageRes;
    let genderRes;
    let emotionRes;
    let embeddingRes;
    const faceRes = [];
    this.state = 'run:face';
    timeStamp = now();
    const faces = await this.models.facemesh?.estimateFaces(input, this.config);
    this.perf.face = Math.trunc(now() - timeStamp);
    for (const face of faces) {
      this.analyze('Get Face');

      // is something went wrong, skip the face
      if (!face.image || face.image.isDisposedInternal) {
        log('Face object is disposed:', face.image);
        continue;
      }

      // run age, inherits face from blazeface
      this.analyze('Start Age:');
      if (this.config.async) {
        ageRes = this.config.face.age.enabled ? age.predict(face.image, this.config) : {};
      } else {
        this.state = 'run:age';
        timeStamp = now();
        ageRes = this.config.face.age.enabled ? await age.predict(face.image, this.config) : {};
        this.perf.age = Math.trunc(now() - timeStamp);
      }

      // run gender, inherits face from blazeface
      this.analyze('Start Gender:');
      if (this.config.async) {
        genderRes = this.config.face.gender.enabled ? gender.predict(face.image, this.config) : {};
      } else {
        this.state = 'run:gender';
        timeStamp = now();
        genderRes = this.config.face.gender.enabled ? await gender.predict(face.image, this.config) : {};
        this.perf.gender = Math.trunc(now() - timeStamp);
      }

      // run emotion, inherits face from blazeface
      this.analyze('Start Emotion:');
      if (this.config.async) {
        emotionRes = this.config.face.emotion.enabled ? emotion.predict(face.image, this.config) : {};
      } else {
        this.state = 'run:emotion';
        timeStamp = now();
        emotionRes = this.config.face.emotion.enabled ? await emotion.predict(face.image, this.config) : {};
        this.perf.emotion = Math.trunc(now() - timeStamp);
      }
      this.analyze('End Emotion:');

      // run emotion, inherits face from blazeface
      this.analyze('Start Embedding:');
      if (this.config.async) {
        embeddingRes = this.config.face.embedding.enabled ? embedding.predict(face.image, this.config) : {};
      } else {
        this.state = 'run:embedding';
        timeStamp = now();
        embeddingRes = this.config.face.embedding.enabled ? await embedding.predict(face.image, this.config) : {};
        this.perf.embedding = Math.trunc(now() - timeStamp);
      }
      this.analyze('End Emotion:');

      // if async wait for results
      if (this.config.async) {
        [ageRes, genderRes, emotionRes, embeddingRes] = await Promise.all([ageRes, genderRes, emotionRes, embeddingRes]);
      }

      this.analyze('Finish Face:');
      // dont need face anymore
      face.image.dispose();

      // calculate iris distance
      // iris: array[ center, left, top, right, bottom]
      if (!this.config.face.iris.enabled) {
        delete face.annotations.leftEyeIris;
        delete face.annotations.rightEyeIris;
      }
      const irisSize = (face.annotations.leftEyeIris && face.annotations.rightEyeIris)
        /* average human iris size is 11.7mm */
        ? 11.7 * Math.max(Math.abs(face.annotations.leftEyeIris[3][0] - face.annotations.leftEyeIris[1][0]), Math.abs(face.annotations.rightEyeIris[4][1] - face.annotations.rightEyeIris[2][1]))
        : 0;

      // combine results
      faceRes.push({
        confidence: face.confidence,
        box: face.box,
        mesh: face.mesh,
        boxRaw: face.boxRaw,
        meshRaw: face.meshRaw,
        annotations: face.annotations,
        age: ageRes.age,
        gender: genderRes.gender,
        genderConfidence: genderRes.confidence,
        emotion: emotionRes,
        embedding: embeddingRes,
        iris: (irisSize !== 0) ? Math.trunc(irisSize) / 100 : 0,
      });
      this.analyze('End Face');
    }
    this.analyze('End FaceMesh:');
    if (this.config.async) {
      if (this.perf.face) delete this.perf.face;
      if (this.perf.age) delete this.perf.age;
      if (this.perf.gender) delete this.perf.gender;
      if (this.perf.emotion) delete this.perf.emotion;
    }
    return faceRes;
  }

  async image(input, userConfig = {}) {
    this.state = 'image';
    this.config = mergeDeep(this.config, userConfig);
    const process = image.process(input, this.config);
    process.tensor.dispose();
    return process.canvas;
  }

  // main detect function
  async detect(input, userConfig = {}) {
    // detection happens inside a promise
    return new Promise(async (resolve) => {
      this.state = 'config';
      let timeStamp;

      // update configuration
      this.config = mergeDeep(this.config, userConfig);

      // sanity checks
      this.state = 'check';
      const error = this.sanity(input);
      if (error) {
        log(error, input);
        resolve({ error });
      }

      let poseRes;
      let handRes;
      let faceRes;

      const timeStart = now();

      // configure backend
      await this.checkBackend();

      // load models if enabled
      await this.load();

      if (this.config.scoped) tf.engine().startScope();
      this.analyze('Start Scope:');

      timeStamp = now();
      const process = image.process(input, this.config);
      if (!process || !process.tensor) {
        log('could not convert input to tensor');
        resolve({ error: 'could not convert input to tensor' });
        return;
      }
      this.perf.image = Math.trunc(now() - timeStamp);
      this.analyze('Get Image:');

      // run face detection followed by all models that rely on face bounding box: face mesh, age, gender, emotion
      if (this.config.async) {
        faceRes = this.config.face.enabled ? this.detectFace(process.tensor) : [];
        if (this.perf.face) delete this.perf.face;
      } else {
        this.state = 'run:face';
        timeStamp = now();
        faceRes = this.config.face.enabled ? await this.detectFace(process.tensor) : [];
        this.perf.face = Math.trunc(now() - timeStamp);
      }

      // run posenet
      this.analyze('Start Body:');
      if (this.config.async) {
        poseRes = this.config.body.enabled ? this.models.posenet?.estimatePoses(process.tensor, this.config) : [];
        if (this.perf.body) delete this.perf.body;
      } else {
        this.state = 'run:body';
        timeStamp = now();
        poseRes = this.config.body.enabled ? await this.models.posenet?.estimatePoses(process.tensor, this.config) : [];
        this.perf.body = Math.trunc(now() - timeStamp);
      }
      this.analyze('End Body:');

      // run handpose
      this.analyze('Start Hand:');
      if (this.config.async) {
        handRes = this.config.hand.enabled ? this.models.handpose?.estimateHands(process.tensor, this.config) : [];
        if (this.perf.hand) delete this.perf.hand;
      } else {
        this.state = 'run:hand';
        timeStamp = now();
        handRes = this.config.hand.enabled ? await this.models.handpose?.estimateHands(process.tensor, this.config) : [];
        this.perf.hand = Math.trunc(now() - timeStamp);
      }
      this.analyze('End Hand:');

      // if async wait for results
      if (this.config.async) {
        [faceRes, poseRes, handRes] = await Promise.all([faceRes, poseRes, handRes]);
      }
      process.tensor.dispose();

      if (this.config.scoped) tf.engine().endScope();
      this.analyze('End Scope:');

      let gestureRes = [];
      if (this.config.gesture.enabled) {
        timeStamp = now();
        gestureRes = [...gesture.face(faceRes), ...gesture.body(poseRes), ...gesture.hand(handRes), ...gesture.iris(faceRes)];
        if (!this.config.async) this.perf.gesture = Math.trunc(now() - timeStamp);
        else if (this.perf.gesture) delete this.perf.gesture;
      }

      this.perf.total = Math.trunc(now() - timeStart);
      this.state = 'idle';
      resolve({ face: faceRes, body: poseRes, hand: handRes, gesture: gestureRes, performance: this.perf, canvas: process.canvas });
    });
  }

  async warmupBitmap() {
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
      res = await this.detect(bitmap, config);
      bitmap.close();
    }
    return res;
  }

  async warmupCanvas() {
    return new Promise((resolve) => {
      let src;
      let size = 0;
      switch (this.config.warmup) {
        case 'face':
          size = 256;
          src = 'data:image/jpeg;base64,' + sample.face;
          break;
        case 'full':
          size = 1200;
          src = 'data:image/jpeg;base64,' + sample.body;
          break;
        default:
          src = null;
      }
      const img = new Image(size, size);
      img.onload = () => {
        const canvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(size, size) : document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, size, size);
        this.detect(data, config).then((res) => resolve(res));
      };
      if (src) img.src = src;
      else resolve(null);
    });
  }

  async warmup(userConfig) {
    const t0 = now();
    if (userConfig) this.config = mergeDeep(this.config, userConfig);
    const video = this.config.videoOptimized;
    this.config.videoOptimized = false;
    let res;
    if (typeof createImageBitmap === 'function') res = await this.warmupBitmap();
    else res = await this.warmupCanvas();
    this.config.videoOptimized = video;
    const t1 = now();
    log('Warmup', this.config.warmup, Math.round(t1 - t0), 'ms', res);
    return res;
  }
}

export { Human as default };
