const tf = require('@tensorflow/tfjs');
const facemesh = require('./facemesh/facemesh.js');
const ssrnet = require('./ssrnet/ssrnet.js');
const emotion = require('./emotion/emotion.js');
const posenet = require('./posenet/posenet.js');
const handpose = require('./handpose/handpose.js');
const fxImage = require('./imagefx.js');
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

function sanity(input) {
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

class Human {
  constructor() {
    this.tf = tf;
    this.version = app.version;
    this.defaults = defaults;
    this.config = defaults;
    this.fx = (tf.ENV.flags.IS_BROWSER && (typeof document !== 'undefined')) ? new fxImage.Canvas() : null;
    this.state = 'idle';
    this.numTensors = 0;
    this.analyzeMemoryLeaks = false;
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
    if (msg && this.config.console) console.log(...msg);
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

  async load(userConfig) {
    if (userConfig) this.config = mergeDeep(defaults, userConfig);
    if (this.config.face.enabled && !this.models.facemesh) {
      this.log('Load model: Face');
      this.models.facemesh = await facemesh.load(this.config.face);
    }
    if (this.config.body.enabled && !this.models.posenet) {
      this.log('Load model: Body');
      this.models.posenet = await posenet.load(this.config.body);
    }
    if (this.config.hand.enabled && !this.models.handpose) {
      this.log('Load model: Hand');
      this.models.handpose = await handpose.load(this.config.hand);
    }
    if (this.config.face.enabled && this.config.face.age.enabled && !this.models.age) {
      this.log('Load model: Age');
      this.models.age = await ssrnet.loadAge(this.config);
    }
    if (this.config.face.enabled && this.config.face.gender.enabled && !this.models.gender) {
      this.log('Load model: Gender');
      this.models.gender = await ssrnet.loadGender(this.config);
    }
    if (this.config.face.enabled && this.config.face.emotion.enabled && !this.models.emotion) {
      this.log('Load model: Emotion');
      this.models.emotion = await emotion.load(this.config);
    }
  }

  tfImage(input) {
    // let imageData;
    let filtered;
    if (this.fx && this.config.filter.enabled && !(input instanceof tf.Tensor)) {
      const width = input.naturalWidth || input.videoWidth || input.width || (input.shape && (input.shape[1] > 0));
      const height = input.naturalHeight || input.videoHeight || input.height || (input.shape && (input.shape[2] > 0));
      const offscreenCanvas = new OffscreenCanvas(width, height);
      const ctx = offscreenCanvas.getContext('2d');
      if (input instanceof ImageData) ctx.putImageData(input, 0, 0);
      else ctx.drawImage(input, 0, 0, width, height, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
      this.fx.reset();
      this.fx.addFilter('brightness', this.config.filter.brightness); // must have at least one filter enabled
      if (this.config.filter.contrast !== 0) this.fx.addFilter('contrast', this.config.filter.contrast);
      if (this.config.filter.sharpness !== 0) this.fx.addFilter('sharpen', this.config.filter.sharpness);
      if (this.config.filter.blur !== 0) this.fx.addFilter('blur', this.config.filter.blur);
      if (this.config.filter.saturation !== 0) this.fx.addFilter('saturation', this.config.filter.saturation);
      if (this.config.filter.hue !== 0) this.fx.addFilter('hue', this.config.filter.hue);
      if (this.config.filter.negative) this.fx.addFilter('negative');
      if (this.config.filter.sepia) this.fx.addFilter('sepia');
      if (this.config.filter.vintage) this.fx.addFilter('brownie');
      if (this.config.filter.sepia) this.fx.addFilter('sepia');
      if (this.config.filter.kodachrome) this.fx.addFilter('kodachrome');
      if (this.config.filter.technicolor) this.fx.addFilter('technicolor');
      if (this.config.filter.polaroid) this.fx.addFilter('polaroid');
      if (this.config.filter.pixelate !== 0) this.fx.addFilter('pixelate', this.config.filter.pixelate);
      filtered = this.fx.apply(offscreenCanvas);
    }
    let tensor;
    if (input instanceof tf.Tensor) {
      tensor = tf.clone(input);
    } else {
      const pixels = tf.browser.fromPixels(filtered || input);
      const casted = pixels.toFloat();
      tensor = casted.expandDims(0);
      pixels.dispose();
      casted.dispose();
    }
    return { tensor, canvas: this.config.filter.return ? filtered : null };
  }

  async detect(input, userConfig = {}) {
    this.state = 'config';
    const perf = {};
    let timeStamp;

    timeStamp = now();
    this.config = mergeDeep(defaults, userConfig);
    if (!this.config.videoOptimized) this.config = mergeDeep(this.config, override);
    perf.config = Math.trunc(now() - timeStamp);

    // sanity checks
    timeStamp = now();
    this.state = 'check';
    const error = sanity(input);
    if (error) {
      this.log(error, input);
      return { error };
    }
    perf.sanity = Math.trunc(now() - timeStamp);

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const timeStart = now();

      // configure backend
      timeStamp = now();
      if (tf.getBackend() !== this.config.backend) {
        this.state = 'backend';
        this.log('Human library setting backend:', this.config.backend);
        await tf.setBackend(this.config.backend);
        await tf.ready();
      }
      perf.backend = Math.trunc(now() - timeStamp);

      // check number of loaded models
      const loadedModels = Object.values(this.models).filter((a) => a).length;
      if (loadedModels === 0) {
        this.log('Human library starting');
        this.log('Configuration:', this.config);
        this.log('Flags:', tf.ENV.flags);
      }

      // load models if enabled
      timeStamp = now();
      this.state = 'load';
      await this.load();
      perf.load = Math.trunc(now() - timeStamp);

      if (this.config.scoped) tf.engine().startScope();

      this.analyze('Start Detect:');

      timeStamp = now();
      const image = this.tfImage(input);
      perf.image = Math.trunc(now() - timeStamp);
      const imageTensor = image.tensor;

      // run posenet
      this.state = 'run:body';
      timeStamp = now();
      this.analyze('Start PoseNet');
      const poseRes = this.config.body.enabled ? await this.models.posenet.estimatePoses(imageTensor, this.config.body) : [];
      this.analyze('End PoseNet:');
      perf.body = Math.trunc(now() - timeStamp);

      // run handpose
      this.state = 'run:hand';
      timeStamp = now();
      this.analyze('Start HandPose:');
      const handRes = this.config.hand.enabled ? await this.models.handpose.estimateHands(imageTensor, this.config.hand) : [];
      this.analyze('End HandPose:');
      perf.hand = Math.trunc(now() - timeStamp);

      // run facemesh, includes blazeface and iris
      const faceRes = [];
      if (this.config.face.enabled) {
        this.state = 'run:face';
        timeStamp = now();
        this.analyze('Start FaceMesh:');
        const faces = await this.models.facemesh.estimateFaces(imageTensor, this.config.face);
        perf.face = Math.trunc(now() - timeStamp);
        for (const face of faces) {
          // is something went wrong, skip the face
          if (!face.image || face.image.isDisposedInternal) {
            this.log('face object is disposed:', face.image);
            continue;
          }
          // run ssr-net age & gender, inherits face from blazeface
          this.state = 'run:agegender';
          timeStamp = now();
          const ssrData = (this.config.face.age.enabled || this.config.face.gender.enabled) ? await ssrnet.predict(face.image, this.config) : {};
          perf.agegender = Math.trunc(now() - timeStamp);
          // run emotion, inherits face from blazeface
          this.state = 'run:emotion';
          timeStamp = now();
          const emotionData = this.config.face.emotion.enabled ? await emotion.predict(face.image, this.config) : {};
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
            age: ssrData.age,
            gender: ssrData.gender,
            agConfidence: ssrData.confidence,
            emotion: emotionData,
            iris: (iris !== 0) ? Math.trunc(100 * 11.7 /* human iris size in mm */ / iris) / 100 : 0,
          });
          this.analyze('End FaceMesh:');
        }
      }

      imageTensor.dispose();
      this.state = 'idle';

      if (this.config.scoped) tf.engine().endScope();
      this.analyze('End Scope:');

      perf.total = Math.trunc(now() - timeStart);
      resolve({ face: faceRes, body: poseRes, hand: handRes, performance: perf, canvas: image.canvas });
    });
  }
}

export { Human as default };
