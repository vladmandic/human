const facemesh = require('./facemesh/index.js');
const ssrnet = require('./ssrnet/index.js');
const posenet = require('./posenet/index.js');
const handpose = require('./handpose/index.js');
// const image = require('./image.js');
// const triangulation = require('./triangulation.js').default;
const defaults = require('./config.js').default;

const models = {
  facemesh: null,
  blazeface: null,
  ssrnet: null,
  iris: null,
};

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
  const config = mergeDeep(defaults, userConfig);

  // run posenet
  let poseRes = [];
  if (config.body.enabled) {
    if (!models.posenet) models.posenet = await posenet.load(config.body);
    poseRes = await models.posenet.estimateMultiplePoses(input, config.body);
  }

  // run handpose
  let handRes = [];
  if (config.hand.enabled) {
    if (!models.handpose) models.handpose = await handpose.load(config.hand);
    handRes = await models.handpose.estimateHands(input, config.hand);
  }

  // run facemesh, includes blazeface and iris
  const faceRes = [];
  if (config.face.enabled) {
    if (!models.facemesh) models.facemesh = await facemesh.load(config.face);
    const faces = await models.facemesh.estimateFaces(input, config.face);
    for (const face of faces) {
      // run ssr-net age & gender, inherits face from blazeface
      const ssrdata = (config.face.age.enabled || config.face.gender.enabled) ? await ssrnet.predict(face.image, config) : {};
      // iris: array[ bottom, left, top, right, center ]
      const iris = (face.annotations.leftEyeIris && face.annotations.rightEyeIris)
        ? Math.max(face.annotations.leftEyeIris[3][0] - face.annotations.leftEyeIris[1][0], face.annotations.rightEyeIris[3][0] - face.annotations.rightEyeIris[1][0])
        : 0;
      faceRes.push({
        confidence: face.confidence,
        box: face.box,
        mesh: face.mesh,
        annotations: face.annotations,
        age: ssrdata.age,
        gender: ssrdata.gender,
        iris: (iris !== 0) ? Math.trunc(100 * 11.7 / iris) / 100 : 0,
      });
    }
  }

  // combine results
  return { face: faceRes, body: poseRes, hand: handRes };
}

exports.detect = detect;
exports.defaults = defaults;
exports.models = models;
exports.facemesh = facemesh;
exports.ssrnet = ssrnet;
exports.posenet = posenet;
exports.handpose = handpose;
