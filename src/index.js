const tf = require('@tensorflow/tfjs');
const facemesh = require('./facemesh/facemesh.js');
const ssrnet = require('./ssrnet/ssrnet.js');
const emotion = require('./emotion/emotion.js');
const posenet = require('./posenet/posenet.js');
const handpose = require('./handpose/handpose.js');
const defaults = require('./config.js').default;

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

async function detect(input, userConfig) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const config = mergeDeep(defaults, userConfig);

    // load models if enabled
    if (config.face.enabled && !models.facemesh) models.facemesh = await facemesh.load(config.face);
    if (config.body.enabled && !models.posenet) models.posenet = await posenet.load(config.body);
    if (config.hand.enabled && !models.handpose) models.handpose = await handpose.load(config.hand);
    if (config.face.enabled && config.face.age.enabled && !models.age) models.age = await ssrnet.loadAge(config);
    if (config.face.enabled && config.face.gender.enabled && !models.gender) models.gender = await ssrnet.loadGender(config);
    if (config.face.enabled && config.face.emotion.enabled && !models.emotion) models.emotion = await emotion.load(config);

    // explictly enable depthwiseconv since it's diasabled by default due to issues with large shaders
    let savedWebglPackDepthwiseConvFlag;
    if (tf.getBackend() === 'webgl') {
      savedWebglPackDepthwiseConvFlag = tf.env().get('WEBGL_PACK_DEPTHWISECONV');
      tf.env().set('WEBGL_PACK_DEPTHWISECONV', true);
    }

    const perf = {};
    let timeStamp;

    // run posenet
    timeStamp = performance.now();
    let poseRes = [];
    tf.engine().startScope();
    if (config.body.enabled) poseRes = await models.posenet.estimatePoses(input, config.body);
    tf.engine().endScope();
    perf.body = Math.trunc(performance.now() - timeStamp);

    // run handpose
    timeStamp = performance.now();
    let handRes = [];
    tf.engine().startScope();
    if (config.hand.enabled) handRes = await models.handpose.estimateHands(input, config.hand);
    tf.engine().endScope();
    perf.hand = Math.trunc(performance.now() - timeStamp);

    // run facemesh, includes blazeface and iris
    const faceRes = [];
    if (config.face.enabled) {
      timeStamp = performance.now();
      tf.engine().startScope();
      const faces = await models.facemesh.estimateFaces(input, config.face);
      perf.face = Math.trunc(performance.now() - timeStamp);
      for (const face of faces) {
        // run ssr-net age & gender, inherits face from blazeface
        timeStamp = performance.now();
        const ssrData = (config.face.age.enabled || config.face.gender.enabled) ? await ssrnet.predict(face.image, config) : {};
        perf.agegender = Math.trunc(performance.now() - timeStamp);
        // run emotion, inherits face from blazeface
        timeStamp = performance.now();
        const emotionData = config.face.emotion.enabled ? await emotion.predict(face.image, config) : {};
        perf.emotion = Math.trunc(performance.now() - timeStamp);
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
exports.models = models;
exports.facemesh = facemesh;
exports.ssrnet = ssrnet;
exports.posenet = posenet;
exports.handpose = handpose;
exports.tf = tf;
