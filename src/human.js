const tf = require('@tensorflow/tfjs');
const facemesh = require('./face/facemesh.js');
const age = require('./age/age.js');
const gender = require('./gender/gender.js');
const emotion = require('./emotion/emotion.js');
const posenet = require('./body/posenet.js');
const handpose = require('./hand/handpose.js');
const gesture = require('./gesture.js');
const image = require('./image.js');
const profile = require('./profile.js');
const defaults = require('../config.js').default;
const app = require('../package.json');

// static config override for non-video detection
const override = {
  face: { detector: { skipFrames: 0 }, age: { skipFrames: 0 }, gender: { skipFrames: 0 }, emotion: { skipFrames: 0 } }, hand: { skipFrames: 0 },
};

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
  constructor() {
    this.tf = tf;
    this.version = app.version;
    this.config = defaults;
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

  // helper function: wrapper around console output
  log(...msg) {
    // eslint-disable-next-line no-console
    if (msg && this.config.console) console.log('Human:', ...msg);
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
    if (leaked !== 0) this.log(...msg, leaked);
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

  // preload models, not explicitly required as it's done automatically on first use
  async load(userConfig) {
    this.state = 'load';
    const timeStamp = now();
    if (userConfig) this.config = mergeDeep(this.config, userConfig);

    if (this.firstRun) {
      this.checkBackend(true);
      this.log(`version: ${this.version} TensorFlow/JS version: ${tf.version_core}`);
      this.log('configuration:', this.config);
      this.log('flags:', tf.ENV.flags);
      this.firstRun = false;
    }
    if (this.config.async) {
      [
        this.models.age,
        this.models.gender,
        this.models.emotion,
        this.models.facemesh,
        this.models.posenet,
        this.models.handpose,
      ] = await Promise.all([
        this.models.age || age.load(this.config),
        this.models.gender || gender.load(this.config),
        this.models.emotion || emotion.load(this.config),
        this.models.facemesh || facemesh.load(this.config.face),
        this.models.posenet || posenet.load(this.config.body),
        this.models.handpose || handpose.load(this.config.hand),
      ]);
    } else {
      if (this.config.face.enabled && !this.models.facemesh) {
        this.log('load model: face');
        this.models.facemesh = await facemesh.load(this.config.face);
      }
      if (this.config.body.enabled && !this.models.posenet) {
        this.log('load model: body');
        this.models.posenet = await posenet.load(this.config.body);
      }
      if (this.config.hand.enabled && !this.models.handpose) {
        this.log('load model: hand');
        this.models.handpose = await handpose.load(this.config.hand);
      }
      if (this.config.face.enabled && this.config.face.age.enabled && !this.models.age) {
        this.log('load model: age');
        this.models.age = await age.load(this.config);
      }
      if (this.config.face.enabled && this.config.face.gender.enabled && !this.models.gender) {
        this.log('load model: gender');
        this.models.gender = await gender.load(this.config);
      }
      if (this.config.face.enabled && this.config.face.emotion.enabled && !this.models.emotion) {
        this.log('load model: emotion');
        this.models.emotion = await emotion.load(this.config);
      }
    }
    const current = Math.trunc(now() - timeStamp);
    if (current > (this.perf.load || 0)) this.perf.load = current;
  }

  // check if backend needs initialization if it changed
  async checkBackend(force) {
    const timeStamp = now();
    if (force || (tf.getBackend() !== this.config.backend)) {
      this.state = 'backend';
      /* force backend reload
      if (this.config.backend in tf.engine().registry) {
        const backendFactory = tf.findBackendFactory(this.config.backend);
        tf.removeBackend(this.config.backend);
        tf.registerBackend(this.config.backend, backendFactory);
      } else {
        this.log('Backend not registred:', this.config.backend);
      }
      */
      this.log('setting backend:', this.config.backend);
      await tf.setBackend(this.config.backend);
      tf.enableProdMode();
      /* debug mode is really too mcuh
      if (this.config.profile) tf.enableDebugMode();
      else tf.enableProdMode();
      */
      if (this.config.deallocate && this.config.backend === 'webgl') {
        this.log('Changing WebGL: WEBGL_DELETE_TEXTURE_THRESHOLD:', this.config.deallocate);
        tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', this.config.deallocate ? 0 : -1);
      }
      // tf.ENV.set('WEBGL_CPU_FORWARD', true);
      // tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true);
      tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', true);
      await tf.ready();
    }
    const current = Math.trunc(now() - timeStamp);
    if (current > (this.perf.backend || 0)) this.perf.backend = current;
  }

  async detectFace(input) {
    // run facemesh, includes blazeface and iris
    // eslint-disable-next-line no-async-promise-executor
    let timeStamp;
    let ageRes;
    let genderRes;
    let emotionRes;
    const faceRes = [];
    this.state = 'run:face';
    timeStamp = now();
    const faces = await this.models.facemesh.estimateFaces(input, this.config.face);
    this.perf.face = Math.trunc(now() - timeStamp);
    for (const face of faces) {
      this.analyze('Get Face');
      // is something went wrong, skip the face
      if (!face.image || face.image.isDisposedInternal) {
        this.log('Face object is disposed:', face.image);
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

      // if async wait for results
      if (this.config.async) {
        [ageRes, genderRes, emotionRes] = await Promise.all([ageRes, genderRes, emotionRes]);
      }

      this.analyze('Finish Face:');
      // dont need face anymore
      face.image.dispose();

      // calculate iris distance
      // iris: array[ bottom, left, top, right, center ]
      const iris = (face.annotations.leftEyeIris && face.annotations.rightEyeIris)
        ? Math.max(face.annotations.leftEyeIris[3][0] - face.annotations.leftEyeIris[1][0], face.annotations.rightEyeIris[3][0] - face.annotations.rightEyeIris[1][0])
        : 0;

      // combine results
      faceRes.push({
        confidence: face.confidence,
        box: face.box,
        mesh: face.mesh,
        annotations: face.annotations,
        age: ageRes.age,
        gender: genderRes.gender,
        genderConfidence: genderRes.confidence,
        emotion: emotionRes,
        iris: (iris !== 0) ? Math.trunc(100 * 11.7 /* human iris size in mm */ / iris) / 100 : 0,
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

  // main detect function
  async detect(input, userConfig = {}) {
    this.state = 'config';
    let timeStamp;

    // update configuration
    this.config = mergeDeep(this.config, userConfig);
    if (!this.config.videoOptimized) this.config = mergeDeep(this.config, override);

    // sanity checks
    this.state = 'check';
    const error = this.sanity(input);
    if (error) {
      this.log(error, input);
      return { error };
    }

    // detection happens inside a promise
    return new Promise(async (resolve) => {
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
        poseRes = this.config.body.enabled ? this.models.posenet.estimatePoses(process.tensor, this.config.body) : [];
        if (this.perf.body) delete this.perf.body;
      } else {
        this.state = 'run:body';
        timeStamp = now();
        poseRes = this.config.body.enabled ? await this.models.posenet.estimatePoses(process.tensor, this.config.body) : [];
        this.perf.body = Math.trunc(now() - timeStamp);
      }
      this.analyze('End Body:');

      // run handpose
      this.analyze('Start Hand:');
      if (this.config.async) {
        handRes = this.config.hand.enabled ? this.models.handpose.estimateHands(process.tensor, this.config.hand) : [];
        if (this.perf.hand) delete this.perf.hand;
      } else {
        this.state = 'run:hand';
        timeStamp = now();
        handRes = this.config.hand.enabled ? await this.models.handpose.estimateHands(process.tensor, this.config.hand) : [];
        this.perf.hand = Math.trunc(now() - timeStamp);
      }
      // this.analyze('End Hand:');

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
        gestureRes = { body: gesture.body(poseRes), hand: gesture.hand(handRes), face: gesture.face(faceRes) };
        if (!this.config.async) this.perf.gesture = Math.trunc(now() - timeStamp);
        else if (this.perf.gesture) delete this.perf.gesture;
      }

      this.perf.total = Math.trunc(now() - timeStart);
      this.state = 'idle';
      resolve({ face: faceRes, body: poseRes, hand: handRes, gesture: gestureRes, performance: this.perf, canvas: process.canvas });
    });
  }
}

export { Human as default };
