const tf = require('@tensorflow/tfjs');
const facemesh = require('./facemesh/facemesh.js');
const ssrnet = require('./ssrnet/ssrnet.js');
const emotion = require('./emotion/emotion.js');
const posenet = require('./posenet/posenet.js');
const handpose = require('./handpose/handpose.js');
const defaults = require('./config.js').default;
const app = require('../package.json');

let config;

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
const now = () => {
  if (typeof performance !== 'undefined') return performance.now();
  return parseInt(Number(process.hrtime.bigint()) / 1000 / 1000);
};

const log = (...msg) => {
  // eslint-disable-next-line no-console
  if (config.console) console.log(...msg);
};

// helper function that performs deep merge of multiple objects so it allows full inheriance with overrides
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
  const width = input.naturalWidth || input.videoWidth || input.width || (input.shape && (input.shape[1] > 0));
  if (!width || (width === 0)) return 'input is empty';
  if (input.readyState && (input.readyState <= 2)) return 'input is not ready';
  try {
    tf.getBackend();
  } catch {
    return 'backend not loaded';
  }
  return null;
}

async function detect(input, userConfig) {
  config = mergeDeep(defaults, userConfig);

  // sanity checks
  const error = sanity(input);
  if (error) {
    log(error, input);
    return { error };
  }

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    // check number of loaded models
    const loadedModels = Object.values(models).filter((a) => a).length;
    if (loadedModels === 0) log('Human library starting');

    // configure backend
    if (tf.getBackend() !== config.backend) {
      log('Human library setting backend:', config.backend);
      await tf.setBackend(config.backend);
      await tf.ready();
    }
    // explictly enable depthwiseconv since it's diasabled by default due to issues with large shaders
    let savedWebglPackDepthwiseConvFlag;
    if (tf.getBackend() === 'webgl') {
      savedWebglPackDepthwiseConvFlag = tf.env().get('WEBGL_PACK_DEPTHWISECONV');
      tf.env().set('WEBGL_PACK_DEPTHWISECONV', true);
    }

    // load models if enabled
    if (config.face.enabled && !models.facemesh) models.facemesh = await facemesh.load(config.face);
    if (config.body.enabled && !models.posenet) models.posenet = await posenet.load(config.body);
    if (config.hand.enabled && !models.handpose) models.handpose = await handpose.load(config.hand);
    if (config.face.enabled && config.face.age.enabled && !models.age) models.age = await ssrnet.loadAge(config);
    if (config.face.enabled && config.face.gender.enabled && !models.gender) models.gender = await ssrnet.loadGender(config);
    if (config.face.enabled && config.face.emotion.enabled && !models.emotion) models.emotion = await emotion.load(config);

    const perf = {};
    let timeStamp;

    // run posenet
    timeStamp = now();
    tf.engine().startScope();
    const poseRes = config.body.enabled ? await models.posenet.estimatePoses(input, config.body) : [];
    tf.engine().endScope();
    perf.body = Math.trunc(now() - timeStamp);

    // run handpose
    timeStamp = now();
    tf.engine().startScope();
    const handRes = config.hand.enabled ? await models.handpose.estimateHands(input, config.hand) : [];
    tf.engine().endScope();
    perf.hand = Math.trunc(now() - timeStamp);

    // run facemesh, includes blazeface and iris
    const faceRes = [];
    if (config.face.enabled) {
      timeStamp = now();
      tf.engine().startScope();
      const faces = await models.facemesh.estimateFaces(input, config.face);
      perf.face = Math.trunc(now() - timeStamp);
      for (const face of faces) {
        // is something went wrong, skip the face
        if (!face.image || face.image.isDisposedInternal) {
          log('face object is disposed:', face.image);
          continue;
        }
        // run ssr-net age & gender, inherits face from blazeface
        timeStamp = now();
        const ssrData = (config.face.age.enabled || config.face.gender.enabled) ? await ssrnet.predict(face.image, config) : {};
        perf.agegender = Math.trunc(now() - timeStamp);
        // run emotion, inherits face from blazeface
        timeStamp = now();
        const emotionData = config.face.emotion.enabled ? await emotion.predict(face.image, config) : {};
        perf.emotion = Math.trunc(now() - timeStamp);
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
          emotion: emotionData,
          iris: (iris !== 0) ? Math.trunc(100 * 11.7 /* human iris size in mm */ / iris) / 100 : 0,
        });
      }
      tf.engine().endScope();
    }

    // set depthwiseconv to original value
    tf.env().set('WEBGL_PACK_DEPTHWISECONV', savedWebglPackDepthwiseConvFlag);

    // combine and return results
    perf.total = Object.values(perf).reduce((a, b) => a + b);
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
