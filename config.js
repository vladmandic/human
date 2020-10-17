/* eslint-disable indent */
/* eslint-disable no-multi-spaces */

export default {
  backend: 'webgl',          // select tfjs backend to use
  console: true,             // enable debugging output to console
  face: {
    enabled: true,           // controls if specified modul is enabled
                             // face.enabled is required for all face models: detector, mesh, iris, age, gender, emotion
                             // (note: module is not loaded until it is required)
    detector: {
      modelPath: '../models/blazeface/back/model.json', // can be 'front' or 'back'.
                                                        // 'front' is optimized for large faces such as front-facing camera and 'back' is optimized for distanct faces.
      inputSize: 256,        // fixed value: 128 for front and 256 for 'back'
      maxFaces: 10,          // maximum number of faces detected in the input, should be set to the minimum number for performance
      skipFrames: 10,        // how many frames to go without re-running the face bounding box detector
                             // if model is running st 25 FPS, we can re-use existing bounding box for updated face mesh analysis
                             // as face probably hasn't moved much in short time (10 * 1/25 = 0.25 sec)
      minConfidence: 0.5,    // threshold for discarding a prediction
      iouThreshold: 0.3,     // threshold for deciding whether boxes overlap too much in non-maximum suppression
      scoreThreshold: 0.7,   // threshold for deciding when to remove boxes based on score in non-maximum suppression
    },
    mesh: {
      enabled: true,
      modelPath: '../models/facemesh/model.json',
      inputSize: 192,        // fixed value
    },
    iris: {
      enabled: true,
      modelPath: '../models/iris/model.json',
      enlargeFactor: 2.3,    // empiric tuning
      inputSize: 64,         // fixed value
    },
    age: {
      enabled: true,
      modelPath: '../models/ssrnet-age/imdb/model.json', // can be 'imdb' or 'wiki'
                                                         // which determines training set for model
      inputSize: 64,         // fixed value
      skipFrames: 10,        // how many frames to go without re-running the detector
    },
    gender: {
      enabled: true,
      minConfidence: 0.8,    // threshold for discarding a prediction
      modelPath: '../models/ssrnet-gender/imdb/model.json',
    },
    emotion: {
      enabled: true,
      inputSize: 64,         // fixed value
      minConfidence: 0.5,    // threshold for discarding a prediction
      skipFrames: 10,        // how many frames to go without re-running the detector
      useGrayscale: true,    // convert image to grayscale before prediction or use highest channel
      modelPath: '../models/emotion/model.json',
    },
  },
  body: {
    enabled: true,
    modelPath: '../models/posenet/model.json',
    inputResolution: 257,    // fixed value
    outputStride: 16,        // fixed value
    maxDetections: 10,       // maximum number of people detected in the input, should be set to the minimum number for performance
    scoreThreshold: 0.7,     // threshold for deciding when to remove boxes based on score in non-maximum suppression
    nmsRadius: 20,           // radius for deciding points are too close in non-maximum suppression
  },
  hand: {
    enabled: true,
    inputSize: 256,          // fixed value
    skipFrames: 10,          // how many frames to go without re-running the hand bounding box detector
                             // if model is running st 25 FPS, we can re-use existing bounding box for updated hand skeleton analysis
                             // as face probably hasn't moved much in short time (10 * 1/25 = 0.25 sec)
    minConfidence: 0.5,      // threshold for discarding a prediction
    iouThreshold: 0.3,       // threshold for deciding whether boxes overlap too much in non-maximum suppression
    scoreThreshold: 0.7,     // threshold for deciding when to remove boxes based on score in non-maximum suppression
    enlargeFactor: 1.65,     // empiric tuning as skeleton prediction prefers hand box with some whitespace
    maxHands: 10,            // maximum number of hands detected in the input, should be set to the minimum number for performance
    detector: {
      anchors: '../models/handdetect/anchors.json',
      modelPath: '../models/handdetect/model.json',
    },
    skeleton: {
      modelPath: '../models/handskeleton/model.json',
    },
  },
};
