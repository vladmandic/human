const tf = require('@tensorflow/tfjs');
const facemesh = require('./facemesh/facemesh.js');
const ssrnet = require('./ssrnet/ssrnet.js');
const emotion = require('./emotion/emotion.js');
const posenet = require('./posenet/posenet.js');
const handpose = require('./handpose/handpose.js');
const gesture = require('./gesture.js');
const image = require('./image.js');
const profile = require('./profile.js');
const defaults = require('../config.js').default;
const app = require('../package.json');

// static config override for non-video detection
const override = {
  face: { detector: { skipFrames: 0 }, age: { skipFrames: 0 }, emotion: { skipFrames: 0 } },
  hand: { skipFrames: 0 },
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
    this.defaults = defaults;
    this.config = defaults;
    this.fx = null;
    this.state = 'idle';
    this.numTensors = 0;
    this.analyzeMemoryLeaks = false;
    this.checkSanity = false;
    this.firstRun = true;
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
    this.ssrnet = ssrnet;
    this.emotion = emotion;
    this.posenet = posenet;
    this.handpose = handpose;
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
    if (userConfig) this.config = mergeDeep(defaults, userConfig);

    if (this.firstRun) {
      this.checkBackend(true);
      this.log(`version: ${this.version} TensorFlow/JS version: ${tf.version_core}`);
      this.log('configuration:', this.config);
      this.log('flags:', tf.ENV.flags);
      this.firstRun = false;
    }

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
      this.models.age = await ssrnet.loadAge(this.config);
    }
    if (this.config.face.enabled && this.config.face.gender.enabled && !this.models.gender) {
      this.log('load model: gender');
      this.models.gender = await ssrnet.loadGender(this.config);
    }
    if (this.config.face.enabled && this.config.face.emotion.enabled && !this.models.emotion) {
      this.log('load model: emotion');
      this.models.emotion = await emotion.load(this.config);
    }
  }

  // check if backend needs initialization if it changed
  async checkBackend(force) {
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
      // tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', true);
      await tf.ready();
    }
  }

  // main detect function
  async detect(input, userConfig = {}) {
    this.state = 'config';
    const perf = {};
    let timeStamp;

    // update configuration
    this.config = mergeDeep(defaults, userConfig);
    if (!this.config.videoOptimized) this.config = mergeDeep(this.config, override);

    // sanity checks
    this.state = 'check';
    const error = this.sanity(input);
    if (error) {
      this.log(error, input);
      return { error };
    }

    // detection happens inside a promise
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      let poseRes;
      let handRes;
      let ssrRes;
      let emotionRes;

      const timeStart = now();

      // configure backend
      timeStamp = now();
      await this.checkBackend();
      perf.backend = Math.trunc(now() - timeStamp);

      // load models if enabled
      timeStamp = now();
      this.state = 'load';
      await this.load();
      perf.load = Math.trunc(now() - timeStamp);

      if (this.config.scoped) tf.engine().startScope();

      this.analyze('Start Detect:');

      timeStamp = now();
      const process = image.process(input, this.config);
      perf.image = Math.trunc(now() - timeStamp);

      // run facemesh, includes blazeface and iris
      const faceRes = [];
      if (this.config.face.enabled) {
        this.state = 'run:face';
        timeStamp = now();
        this.analyze('Start FaceMesh:');
        const faces = await this.models.facemesh.estimateFaces(process.tensor, this.config.face);
        perf.face = Math.trunc(now() - timeStamp);
        for (const face of faces) {
          // is something went wrong, skip the face
          if (!face.image || face.image.isDisposedInternal) {
            this.log('Face object is disposed:', face.image);
            continue;
          }
          // run ssr-net age & gender, inherits face from blazeface
          this.state = 'run:agegender';
          timeStamp = now();
          ssrRes = (this.config.face.age.enabled || this.config.face.gender.enabled) ? await ssrnet.predict(face.image, this.config) : {};
          perf.agegender = Math.trunc(now() - timeStamp);
          // run emotion, inherits face from blazeface
          this.state = 'run:emotion';
          timeStamp = now();
          emotionRes = this.config.face.emotion.enabled ? await emotion.predict(face.image, this.config) : {};
          perf.emotion = Math.trunc(now() - timeStamp);

          // dont need face anymore
          face.image.dispose();
          // calculate iris distance
          // iris: array[ bottom, left, top, right, center ]
          const iris = (face.annotations.leftEyeIris && face.annotations.rightEyeIris)
            ? Math.max(face.annotations.leftEyeIris[3][0] - face.annotations.leftEyeIris[1][0], face.annotations.rightEyeIris[3][0] - face.annotations.rightEyeIris[1][0])
            : 0;
          faceRes.push({
            confidence: face.confidence,
            box: face.box,
            mesh: face.mesh,
            annotations: face.annotations,
            age: ssrRes.age,
            gender: ssrRes.gender,
            agConfidence: ssrRes.confidence,
            emotion: emotionRes,
            iris: (iris !== 0) ? Math.trunc(100 * 11.7 /* human iris size in mm */ / iris) / 100 : 0,
          });
          this.analyze('End FaceMesh:');
        }
      }

      // run posenet
      if (this.config.async) {
        poseRes = this.config.body.enabled ? this.models.posenet.estimatePoses(process.tensor, this.config.body) : [];
      } else {
        this.state = 'run:body';
        timeStamp = now();
        this.analyze('Start PoseNet');
        poseRes = this.config.body.enabled ? await this.models.posenet.estimatePoses(process.tensor, this.config.body) : [];
        this.analyze('End PoseNet:');
        perf.body = Math.trunc(now() - timeStamp);
      }

      // run handpose
      if (this.config.async) {
        handRes = this.config.hand.enabled ? this.models.handpose.estimateHands(process.tensor, this.config.hand) : [];
      } else {
        this.state = 'run:hand';
        timeStamp = now();
        this.analyze('Start HandPose:');
        handRes = this.config.hand.enabled ? await this.models.handpose.estimateHands(process.tensor, this.config.hand) : [];
        this.analyze('End HandPose:');
        perf.hand = Math.trunc(now() - timeStamp);
      }

      if (this.config.async) [poseRes, handRes] = await Promise.all([poseRes, handRes]);

      process.tensor.dispose();
      this.state = 'idle';

      if (this.config.scoped) tf.engine().endScope();
      this.analyze('End Scope:');

      let gestureRes = [];
      if (this.config.gesture.enabled) {
        timeStamp = now();
        gestureRes = { body: gesture.body(poseRes), hand: gesture.hand(handRes), face: gesture.face(faceRes) };
        perf.gesture = Math.trunc(now() - timeStamp);
      }

      perf.total = Math.trunc(now() - timeStart);
      resolve({ face: faceRes, body: poseRes, hand: handRes, gesture: gestureRes, performance: perf, canvas: process.canvas });
    });
  }
}

export { Human as default };
