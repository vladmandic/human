const tf = require('@tensorflow/tfjs');
const facemesh = require('./facemesh/facemesh.js');
const ssrnet = require('./ssrnet/ssrnet.js');
const emotion = require('./emotion/emotion.js');
const posenet = require('./posenet/posenet.js');
const handpose = require('./handpose/handpose.js');
const defaults = require('../config.js').default;
const app = require('../package.json');

let config;
let state = 'idle';

// object that contains all initialized models
const models = {
  facemesh: null,
  posenet: null,
  handpose: null,
  iris: null,
  age: null,
  gender: null,
  emotion: null,
};

const override = {
  face: { detector: { skipFrames: 0 }, age: { skipFrames: 0 }, emotion: { skipFrames: 0 } },
  hand: { skipFrames: 0 },
};

// helper function: gets elapsed time on both browser and nodejs
const now = () => {
  if (typeof performance !== 'undefined') return performance.now();
  return parseInt(Number(process.hrtime.bigint()) / 1000 / 1000);
};

// helper function: wrapper around console output
const log = (...msg) => {
  // eslint-disable-next-line no-console
  if (msg && config.console) console.log(...msg);
};

// helper function: measure tensor leak
let numTensors = 0;
const analyzeMemoryLeaks = false;
const analyze = (...msg) => {
  if (!analyzeMemoryLeaks) return;
  const current = tf.engine().state.numTensors;
  const previous = numTensors;
  numTensors = current;
  const leaked = current - previous;
  if (leaked !== 0) log(...msg, leaked);
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
  if (tf.ENV.flags.IS_BROWSER && (input instanceof ImageData || input instanceof HTMLImageElement || input instanceof HTMLCanvasElement || input instanceof HTMLVideoElement || input instanceof HTMLMediaElement)) {
    const width = input.naturalWidth || input.videoWidth || input.width || (input.shape && (input.shape[1] > 0));
    if (!width || (width === 0)) return 'input is empty';
  }
  if (tf.ENV.flags.IS_BROWSER && (input instanceof HTMLVideoElement || input instanceof HTMLMediaElement)) {
    if (input.readyState && (input.readyState <= 2)) return 'input is not ready';
  }
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

async function load(userConfig) {
  if (userConfig) config = mergeDeep(defaults, userConfig);
  if (config.face.enabled && !models.facemesh) models.facemesh = await facemesh.load(config.face);
  if (config.body.enabled && !models.posenet) models.posenet = await posenet.load(config.body);
  if (config.hand.enabled && !models.handpose) models.handpose = await handpose.load(config.hand);
  if (config.face.enabled && config.face.age.enabled && !models.age) models.age = await ssrnet.loadAge(config);
  if (config.face.enabled && config.face.gender.enabled && !models.gender) models.gender = await ssrnet.loadGender(config);
  if (config.face.enabled && config.face.emotion.enabled && !models.emotion) models.emotion = await emotion.load(config);
}

async function detect(input, userConfig = {}) {
  state = 'config';
  const perf = {};
  let timeStamp;

  timeStamp = now();
  const shouldOverride = tf.ENV.flags.IS_NODE || (tf.ENV.flags.IS_BROWSER && !((input instanceof HTMLVideoElement) || (input instanceof HTMLMediaElement)));
  config = mergeDeep(defaults, userConfig, shouldOverride ? override : {});
  perf.config = Math.trunc(now() - timeStamp);

  // sanity checks
  timeStamp = now();
  state = 'check';
  const error = sanity(input);
  if (error) {
    log(error, input);
    return { error };
  }
  perf.sanity = Math.trunc(now() - timeStamp);

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const timeStart = now();

    // configure backend
    timeStamp = now();
    if (tf.getBackend() !== config.backend) {
      state = 'backend';
      log('Human library setting backend:', config.backend);
      await tf.setBackend(config.backend);
      await tf.ready();
    }
    perf.backend = Math.trunc(now() - timeStamp);

    // check number of loaded models
    const loadedModels = Object.values(models).filter((a) => a).length;
    if (loadedModels === 0) {
      log('Human library starting');
      log('Configuration:', config);
      log('Flags:', tf.ENV.flags);
    }

    // load models if enabled
    timeStamp = now();
    state = 'load';
    await load();
    perf.load = Math.trunc(now() - timeStamp);

    if (config.scoped) tf.engine().startScope();

    analyze('Start Detect:');

    // run posenet
    state = 'run:body';
    timeStamp = now();
    analyze('Start PoseNet');
    const poseRes = config.body.enabled ? await models.posenet.estimatePoses(input, config.body) : [];
    analyze('End PoseNet:');
    perf.body = Math.trunc(now() - timeStamp);

    // run handpose
    state = 'run:hand';
    timeStamp = now();
    analyze('Start HandPose:');
    const handRes = config.hand.enabled ? await models.handpose.estimateHands(input, config.hand) : [];
    analyze('End HandPose:');
    perf.hand = Math.trunc(now() - timeStamp);

    // run facemesh, includes blazeface and iris
    const faceRes = [];
    if (config.face.enabled) {
      state = 'run:face';
      timeStamp = now();
      analyze('Start FaceMesh:');
      const faces = await models.facemesh.estimateFaces(input, config.face);
      perf.face = Math.trunc(now() - timeStamp);
      for (const face of faces) {
        // is something went wrong, skip the face
        if (!face.image || face.image.isDisposedInternal) {
          log('face object is disposed:', face.image);
          continue;
        }
        // run ssr-net age & gender, inherits face from blazeface
        state = 'run:agegender';
        timeStamp = now();
        const ssrData = (config.face.age.enabled || config.face.gender.enabled) ? await ssrnet.predict(face.image, config) : {};
        perf.agegender = Math.trunc(now() - timeStamp);
        // run emotion, inherits face from blazeface
        state = 'run:emotion';
        timeStamp = now();
        const emotionData = config.face.emotion.enabled ? await emotion.predict(face.image, config) : {};
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
      }
      analyze('End FaceMesh:');
    }

    state = 'idle';

    if (config.scoped) tf.engine().endScope();
    analyze('End Scope:');

    perf.total = Math.trunc(now() - timeStart);
    resolve({ face: faceRes, body: poseRes, hand: handRes, performance: perf });
  });
}

exports.detect = detect;
exports.defaults = defaults;
exports.config = config;
exports.models = models;
exports.facemesh = facemesh;
exports.ssrnet = ssrnet;
exports.posenet = posenet;
exports.handpose = handpose;
exports.tf = tf;
exports.version = app.version;
exports.state = state;

// Error: Failed to compile fragment shader
