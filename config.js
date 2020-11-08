/* eslint-disable indent */
/* eslint-disable no-multi-spaces */

export default {
  backend: 'webgl',          // select tfjs backend to use
  console: true,             // enable debugging output to console
  async: true,               // execute enabled models in parallel
                             // this disables per-model performance data but slightly increases performance
                             // cannot be used if profiling is enabled
  profile: false,            // enable tfjs profiling
                             // this has significant performance impact, only enable for debugging purposes
                             // currently only implemented for age,gender,emotion models
  deallocate: false,         // aggresively deallocate gpu memory after each usage
                             // only valid for webgl backend and only during first call, cannot be changed unless library is reloaded
                             // this has significant performance impact, only enable on low-memory devices
  scoped: false,             // enable scoped runs
                             // some models *may* have memory leaks, this wrapps everything in a local scope at a cost of performance
                             // typically not needed
  videoOptimized: true,      // perform additional optimizations when input is video, must be disabled for images
                             // basically this skips object box boundary detection for every n frames
                             // while maintaining in-box detection since objects cannot move that fast
  filter: {
    enabled: true,           // enable image pre-processing filters
    width: 0,                // resize input width
    height: 0,               // resize input height
                             // if both width and height are set to 0, there is no resizing
                             // if just one is set, second one is scaled automatically
                             // if both are set, values are used as-is
    return: true,            // return processed canvas imagedata in result
    brightness: 0,           // range: -1 (darken) to 1 (lighten)
    contrast: 0,             // range: -1 (reduce contrast) to 1 (increase contrast)
    sharpness: 0,            // range: 0 (no sharpening) to 1 (maximum sharpening)
    blur: 0,                 // range: 0 (no blur) to N (blur radius in pixels)
    saturation: 0,           // range: -1 (reduce saturation) to 1 (increase saturation)
    hue: 0,                  // range: 0 (no change) to 360 (hue rotation in degrees)
    negative: false,         // image negative
    sepia: false,            // image sepia colors
    vintage: false,          // image vintage colors
    kodachrome: false,       // image kodachrome colors
    technicolor: false,      // image technicolor colors
    polaroid: false,         // image polaroid camera effect
    pixelate: 0,             // range: 0 (no pixelate) to N (number of pixels to pixelate)
  },
  gesture: {
    enabled: true,           // enable simple gesture recognition
  },
  face: {
    enabled: true,           // controls if specified modul is enabled
                             // face.enabled is required for all face models: detector, mesh, iris, age, gender, emotion
                             // (note: module is not loaded until it is required)
    detector: {
      modelPath: '../models/blazeface-back.json', // can be 'front' or 'back'.
                                                  // 'front' is optimized for large faces such as front-facing camera and 'back' is optimized for distanct faces.
      inputSize: 256,        // fixed value: 128 for front and 256 for 'back'
      maxFaces: 10,          // maximum number of faces detected in the input, should be set to the minimum number for performance
      skipFrames: 15,        // how many frames to go without re-running the face bounding box detector, only used for video inputs
                             // if model is running st 25 FPS, we can re-use existing bounding box for updated face mesh analysis
                             // as face probably hasn't moved much in short time (10 * 1/25 = 0.25 sec)
      minConfidence: 0.1,    // threshold for discarding a prediction
      iouThreshold: 0.1,     // threshold for deciding whether boxes overlap too much in non-maximum suppression (0.1 means drop if overlap 10%)
      scoreThreshold: 0.2,   // threshold for deciding when to remove boxes based on score in non-maximum suppression, this is applied on detection objects only and before minConfidence
    },
    mesh: {
      enabled: true,
      modelPath: '../models/facemesh.json',
      inputSize: 192,        // fixed value
    },
    iris: {
      enabled: true,
      modelPath: '../models/iris.json',
      enlargeFactor: 2.3,    // empiric tuning
      inputSize: 64,         // fixed value
    },
    age: {
      enabled: true,
      modelPath: '../models/age-ssrnet-imdb.json', // can be 'age-ssrnet-imdb' or 'age-ssrnet-wiki'
                                                   // which determines training set for model
      inputSize: 64,         // fixed value
      skipFrames: 15,        // how many frames to go without re-running the detector, only used for video inputs
    },
    gender: {
      enabled: true,
      minConfidence: 0.1,    // threshold for discarding a prediction
      modelPath: '../models/gender-ssrnet-imdb.json', // can be 'gender', 'gender-ssrnet-imdb' or 'gender-ssrnet-wiki'
      inputSize: 64,         // fixed value
      skipFrames: 15,        // how many frames to go without re-running the detector, only used for video inputs
    },
    emotion: {
      enabled: true,
      inputSize: 64,         // fixed value
      minConfidence: 0.2,    // threshold for discarding a prediction
      skipFrames: 15,        // how many frames to go without re-running the detector
      modelPath: '../models/emotion-large.json', // can be 'mini', 'large'
    },
  },
  body: {
    enabled: true,
    modelPath: '../models/posenet.json',
    inputResolution: 257,    // fixed value
    outputStride: 16,        // fixed value
    maxDetections: 10,       // maximum number of people detected in the input, should be set to the minimum number for performance
    scoreThreshold: 0.8,     // threshold for deciding when to remove boxes based on score in non-maximum suppression
    nmsRadius: 20,           // radius for deciding points are too close in non-maximum suppression
  },
  hand: {
    enabled: true,
    inputSize: 256,          // fixed value
    skipFrames: 15,          // how many frames to go without re-running the hand bounding box detector, only used for video inputs
                             // if model is running st 25 FPS, we can re-use existing bounding box for updated hand skeleton analysis
                             // as the hand probably hasn't moved much in short time (10 * 1/25 = 0.25 sec)
    minConfidence: 0.5,      // threshold for discarding a prediction
    iouThreshold: 0.1,       // threshold for deciding whether boxes overlap too much in non-maximum suppression
    scoreThreshold: 0.8,     // threshold for deciding when to remove boxes based on score in non-maximum suppression
    enlargeFactor: 1.65,     // empiric tuning as skeleton prediction prefers hand box with some whitespace
    maxHands: 1,             // maximum number of hands detected in the input, should be set to the minimum number for performance
    detector: {
      modelPath: '../models/handdetect.json',
    },
    skeleton: {
      modelPath: '../models/handskeleton.json',
    },
  },
};
