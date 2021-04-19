/* eslint-disable indent */
/* eslint-disable no-multi-spaces */

/**
 * Configuration interface definition for **Human** library
 *
 * Contains all configurable parameters
 */
export interface Config {
  /** Backend used for TFJS operations */
  backend: null | '' | 'cpu' | 'wasm' | 'webgl' | 'humangl' | 'tensorflow',
  /** Path to *.wasm files if backend is set to `wasm` */
  wasmPath: string,
  /** Print debug statements to console */
  debug: boolean,
  /** Perform model loading and inference concurrently or sequentially */
  async: boolean,
  /** Collect and print profiling data during inference operations */
  profile: boolean,
  /** Internal: Use aggressive GPU memory deallocator when backend is set to `webgl` or `humangl` */
  deallocate: boolean,
  /** Internal: Run all inference operations in an explicit local scope run to avoid memory leaks */
  scoped: boolean,
  /** Perform additional optimizations when input is video,
   * - must be disabled for images
   * - automatically disabled for Image, ImageData, ImageBitmap and Tensor inputs
   * - skips boundary detection for every `skipFrames` frames specified for each model
   * - while maintaining in-box detection since objects don't change definition as fast */
  videoOptimized: boolean,
  /** What to use for `human.warmup()`
   * - warmup pre-initializes all models for faster inference but can take significant time on startup
   * - only used for `webgl` and `humangl` backends
  */
  warmup: 'none' | 'face' | 'full' | 'body',
  /** Base model path (typically starting with file://, http:// or https://) for all models
   * - individual modelPath values are joined to this path
  */
  modelBasePath: string,
  /** Run input through image filters before inference
   * - image filters run with near-zero latency as they are executed on the GPU
  */
  filter: {
    enabled: boolean,
    /** Resize input width
    * - if both width and height are set to 0, there is no resizing
    * - if just one is set, second one is scaled automatically
    * - if both are set, values are used as-is
    */
    width: number,
    /** Resize input height
    * - if both width and height are set to 0, there is no resizing
    * - if just one is set, second one is scaled automatically
    * - if both are set, values are used as-is
    */
    height: number,
    /** Return processed canvas imagedata in result */
    return: boolean,
    /** Flip input as mirror image */
    flip: boolean,
    /** Range: -1 (darken) to 1 (lighten) */
    brightness: number,
    /** Range: -1 (reduce contrast) to 1 (increase contrast) */
    contrast: number,
    /** Range: 0 (no sharpening) to 1 (maximum sharpening) */
    sharpness: number,
    /** Range: 0 (no blur) to N (blur radius in pixels) */
    blur: number
    /** Range: -1 (reduce saturation) to 1 (increase saturation) */
    saturation: number,
    /** Range: 0 (no change) to 360 (hue rotation in degrees) */
    hue: number,
    /** Image negative */
    negative: boolean,
    /** Image sepia colors */
    sepia: boolean,
    /** Image vintage colors */
    vintage: boolean,
    /** Image kodachrome colors */
    kodachrome: boolean,
    /** Image technicolor colors */
    technicolor: boolean,
    /** Image polaroid camera effect */
    polaroid: boolean,
    /** Range: 0 (no pixelate) to N (number of pixels to pixelate) */
    pixelate: number,
  },
  // type definition end

  /** Controlls gesture detection */
  gesture: {
    enabled: boolean,
  },
  /** Controlls and configures all face-specific options:
   * - face detection, face mesh detection, age, gender, emotion detection and face description
   * Parameters:
   * - enabled: true/false
   * - modelPath: path for individual face model
   * - rotation: use calculated rotated face image or just box with rotation as-is, false means higher performance, but incorrect mesh mapping on higher face angles
   * - maxFaces: maximum number of faces detected in the input, should be set to the minimum number for performance
   * - skipFrames: how many frames to go without re-running the face detector and just run modified face mesh analysis, only valid if videoOptimized is set to true
   * - skipInitial: if previous detection resulted in no faces detected, should skipFrames be reset immediately to force new detection cycle
   * - minConfidence: threshold for discarding a prediction
   * - iouThreshold: threshold for deciding whether boxes overlap too much in non-maximum suppression
   * - scoreThreshold: threshold for deciding when to remove boxes based on score in non-maximum suppression
   * - return extracted face as tensor for futher user processing
  */
  face: {
    enabled: boolean,
    detector: {
      modelPath: string,
      rotation: boolean,
      maxFaces: number,
      skipFrames: number,
      skipInitial: boolean,
      minConfidence: number,
      iouThreshold: number,
      scoreThreshold: number,
      return: boolean,
    },
    mesh: {
      enabled: boolean,
      modelPath: string,
    },
    iris: {
      enabled: boolean,
      modelPath: string,
    },
    description: {
      enabled: boolean,
      modelPath: string,
      skipFrames: number,
    },
    age: {
      enabled: boolean,
      modelPath: string,
      skipFrames: number,
    },
    gender: {
      enabled: boolean,
      minConfidence: number,
      modelPath: string,
      skipFrames: number,
    },
    emotion: {
      enabled: boolean,
      minConfidence: number,
      skipFrames: number,
      modelPath: string,
    },
    embedding: {
      enabled: boolean,
      modelPath: string,
    },
  },
  /** Controlls and configures all body detection specific options
   * - enabled: true/false
   * - modelPath: paths for both hand detector model and hand skeleton model
   * - maxDetections: maximum number of people detected in the input, should be set to the minimum number for performance
   * - scoreThreshold: threshold for deciding when to remove people based on score in non-maximum suppression
   * - nmsRadius: threshold for deciding whether body parts overlap too much in non-maximum suppression
  */
  body: {
    enabled: boolean,
    modelPath: string,
    maxDetections: number,
    scoreThreshold: number,
    nmsRadius: number,
  },
  /** Controlls and configures all hand detection specific options
   * - enabled: true/false
   * - modelPath: paths for both hand detector model and hand skeleton model
   * - rotation: use best-guess rotated hand image or just box with rotation as-is, false means higher performance, but incorrect finger mapping if hand is inverted
   * - skipFrames: how many frames to go without re-running the hand bounding box detector and just run modified hand skeleton detector, only valid if videoOptimized is set to true
   * - skipInitial: if previous detection resulted in no hands detected, should skipFrames be reset immediately to force new detection cycle
   * - minConfidence: threshold for discarding a prediction
   * - iouThreshold: threshold for deciding whether boxes overlap too much in non-maximum suppression
   * - scoreThreshold: threshold for deciding when to remove boxes based on score in non-maximum suppression
   * - maxHands: maximum number of hands detected in the input, should be set to the minimum number for performance
   * - landmarks: detect hand landmarks or just hand boundary box
  */
  hand: {
    enabled: boolean,
    rotation: boolean,
    skipFrames: number,
    skipInitial: boolean,
    minConfidence: number,
    iouThreshold: number,
    scoreThreshold: number,
    maxHands: number,
    landmarks: boolean,
    detector: {
      modelPath: string,
    },
    skeleton: {
      modelPath: string,
    },
  },
  /** Controlls and configures all object detection specific options
   * - minConfidence: minimum score that detection must have to return as valid object
   * - iouThreshold: ammount of overlap between two detected objects before one object is removed
   * - maxResults: maximum number of detections to return
   * - skipFrames: run object detection every n input frames, only valid if videoOptimized is set to true
  */
  object: {
    enabled: boolean,
    modelPath: string,
    minConfidence: number,
    iouThreshold: number,
    maxResults: number,
    skipFrames: number,
  },
}

const config: Config = {
  backend: 'webgl',          // select tfjs backend to use
                             // can be 'webgl', 'wasm', 'cpu', or 'humangl' which is a custom version of webgl
                             // leave as empty string to continue using default backend
                             // when backend is set outside of Human library
  modelBasePath: '../models/', // base path for all models
  wasmPath: '../assets/',    // path for wasm binaries
                             // only used for backend: wasm
  debug: true,               // print additional status messages to console
  async: true,               // execute enabled models in parallel
                             // this disables per-model performance data but
                             // slightly increases performance
                             // cannot be used if profiling is enabled
  profile: false,            // internal: enable tfjs profiling
                             // this has significant performance impact
                             // only enable for debugging purposes
                             // currently only implemented for age,gender,emotion models
  deallocate: false,         // internal: aggresively deallocate gpu memory after each usage
                             // only valid for webgl and humangl backend and only during first call
                             // cannot be changed unless library is reloaded
                             // this has significant performance impact
                             // only enable on low-memory devices
  scoped: false,             // internal: enable scoped runs
                             // some models *may* have memory leaks,
                             // this wrapps everything in a local scope at a cost of performance
                             // typically not needed
  videoOptimized: true,      // perform additional optimizations when input is video,
                             // must be disabled for images
                             // automatically disabled for Image, ImageData, ImageBitmap and Tensor inputs
                             // skips boundary detection for every n frames
                             // while maintaining in-box detection since objects cannot move that fast
  warmup: 'face',            // what to use for human.warmup(), can be 'none', 'face', 'full'
                             // warmup pre-initializes all models for faster inference but can take
                             // significant time on startup
                             // only used for `webgl` and `humangl` backends
  filter: {                  // run input through image filters before inference
                             // image filters run with near-zero latency as they are executed on the GPU
    enabled: true,           // enable image pre-processing filters
    width: 0,                // resize input width
    height: 0,               // resize input height
                             // if both width and height are set to 0, there is no resizing
                             // if just one is set, second one is scaled automatically
                             // if both are set, values are used as-is
    flip: false,             // flip input as mirror image
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
                             // face.enabled is required for all face models:
                             // detector, mesh, iris, age, gender, emotion
                             // (note: module is not loaded until it is required)
    detector: {
      modelPath: 'blazeface-back.json', // detector model
                             // can be either absolute path or relative to modelBasePath
      rotation: false,       // use best-guess rotated face image or just box with rotation as-is
                             // false means higher performance, but incorrect mesh mapping if face angle is above 20 degrees
                             // this parameter is not valid in nodejs
      maxFaces: 10,          // maximum number of faces detected in the input
                             // should be set to the minimum number for performance
      skipFrames: 21,        // how many frames to go without re-running the face bounding box detector
                             // only used for video inputs
                             // e.g., if model is running st 25 FPS, we can re-use existing bounding
                             // box for updated face analysis as the head probably hasn't moved much
                             // in short time (10 * 1/25 = 0.25 sec)
      skipInitial: false,    // if previous detection resulted in no faces detected,
                             // should skipFrames be reset immediately to force new detection cycle
      minConfidence: 0.2,    // threshold for discarding a prediction
      iouThreshold: 0.1,     // threshold for deciding whether boxes overlap too much in
                             // non-maximum suppression (0.1 means drop if overlap 10%)
      scoreThreshold: 0.2,   // threshold for deciding when to remove boxes based on score
                             // in non-maximum suppression,
                             // this is applied on detection objects only and before minConfidence
      return: false,         // return extracted face as tensor
    },

    mesh: {
      enabled: true,
      modelPath: 'facemesh.json',  // facemesh model
                             // can be either absolute path or relative to modelBasePath
    },

    iris: {
      enabled: true,
      modelPath: 'iris.json',  // face iris model
                             // can be either absolute path or relative to modelBasePath
    },

    description: {
      enabled: true,         // to improve accuracy of face description extraction it is
                             // recommended to enable detector.rotation and mesh.enabled
      modelPath: 'faceres.json',  // face description model
                             // can be either absolute path or relative to modelBasePath
      skipFrames: 31,        // how many frames to go without re-running the detector
                             // only used for video inputs
    },

    emotion: {
      enabled: true,
      minConfidence: 0.1,    // threshold for discarding a prediction
      skipFrames: 32,        // how many frames to go without re-running the detector
      modelPath: 'emotion.json',  // face emotion model
                             // can be either absolute path or relative to modelBasePath
    },

    age: {
      enabled: false,        // obsolete, replaced by description module
      modelPath: 'age.json',  // age model
                             // can be either absolute path or relative to modelBasePath
      skipFrames: 33,        // how many frames to go without re-running the detector
                             // only used for video inputs
    },

    gender: {
      enabled: false,        // obsolete, replaced by description module
      minConfidence: 0.1,    // threshold for discarding a prediction
      modelPath: 'gender.json',  // gender model
                             // can be either absolute path or relative to modelBasePath
      skipFrames: 34,        // how many frames to go without re-running the detector
                             // only used for video inputs
    },

    embedding: {
      enabled: false,        // obsolete, replaced by description module
      modelPath: 'mobileface.json',  // face descriptor model
                             // can be either absolute path or relative to modelBasePath
                            },
  },

  body: {
    enabled: true,
    modelPath: 'posenet.json',  // body model
                             // can be either absolute path or relative to modelBasePath
                             // can be 'posenet', 'blazepose' or 'efficientpose'
                             // 'blazepose' and 'efficientpose' are experimental
    maxDetections: 10,       // maximum number of people detected in the input
                             // should be set to the minimum number for performance
                             // only valid for posenet as blazepose only detects single pose
    scoreThreshold: 0.3,     // threshold for deciding when to remove boxes based on score
                             // in non-maximum suppression
                             // only valid for posenet as blazepose only detects single pose
    nmsRadius: 20,           // radius for deciding points are too close in non-maximum suppression
                             // only valid for posenet as blazepose only detects single pose
  },

  hand: {
    enabled: true,
    rotation: false,         // use best-guess rotated hand image or just box with rotation as-is
                             // false means higher performance, but incorrect finger mapping if hand is inverted
    skipFrames: 12,          // how many frames to go without re-running the hand bounding box detector
                             // only used for video inputs
                             // e.g., if model is running st 25 FPS, we can re-use existing bounding
                             // box for updated hand skeleton analysis as the hand probably
                             // hasn't moved much in short time (10 * 1/25 = 0.25 sec)
    skipInitial: false,      // if previous detection resulted in no hands detected,
                             // should skipFrames be reset immediately to force new detection cycle
    minConfidence: 0.1,      // threshold for discarding a prediction
    iouThreshold: 0.1,       // threshold for deciding whether boxes overlap too much
                             // in non-maximum suppression
    scoreThreshold: 0.5,     // threshold for deciding when to remove boxes based on
                             // score in non-maximum suppression
    maxHands: 1,             // maximum number of hands detected in the input
                             // should be set to the minimum number for performance
    landmarks: true,         // detect hand landmarks or just hand boundary box
    detector: {
      modelPath: 'handdetect.json',  // hand detector model
                             // can be either absolute path or relative to modelBasePath
    },
    skeleton: {
      modelPath: 'handskeleton.json',  // hand skeleton model
                             // can be either absolute path or relative to modelBasePath
    },
  },

  object: {
    enabled: false,
    modelPath: 'nanodet.json',  // object detection model
                             // can be either absolute path or relative to modelBasePath
                             // 'nanodet' is experimental
    minConfidence: 0.20,     // threshold for discarding a prediction
    iouThreshold: 0.40,      // threshold for deciding whether boxes overlap too much
                             // in non-maximum suppression
    maxResults: 10,          // maximum number of objects detected in the input
    skipFrames: 41,          // how many frames to go without re-running the detector
  },
};
export { config as defaults };
