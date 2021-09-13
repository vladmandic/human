/* eslint-disable indent */
/* eslint-disable no-multi-spaces */

export interface FaceDetectorConfig {
  modelPath: string,
  rotation: boolean,
  maxDetected: number,
  skipFrames: number,
  minConfidence: number,
  iouThreshold: number,
  return: boolean,
}

export interface FaceMeshConfig {
  enabled: boolean,
  modelPath: string,
}

export interface FaceIrisConfig {
  enabled: boolean,
  modelPath: string,
}

export interface FaceDescriptionConfig {
  enabled: boolean,
  modelPath: string,
  skipFrames: number,
  minConfidence: number,
}

export interface FaceEmotionConfig {
  enabled: boolean,
  minConfidence: number,
  skipFrames: number,
  modelPath: string,
}

/** Controlls and configures all face-specific options:
 * - face detection, face mesh detection, age, gender, emotion detection and face description
 * Parameters:
 * - enabled: true/false
 * - modelPath: path for each of face models
 * - minConfidence: threshold for discarding a prediction
 * - iouThreshold: ammount of overlap between two detected objects before one object is removed
 * - maxDetected: maximum number of faces detected in the input, should be set to the minimum number for performance
 * - rotation: use calculated rotated face image or just box with rotation as-is, false means higher performance, but incorrect mesh mapping on higher face angles
 * - return: return extracted face as tensor for futher user processing, in which case user is reponsible for manually disposing the tensor
*/
export interface FaceConfig {
  enabled: boolean,
  detector: Partial<FaceDetectorConfig>,
  mesh: Partial<FaceMeshConfig>,
  iris: Partial<FaceIrisConfig>,
  description: Partial<FaceDescriptionConfig>,
  emotion: Partial<FaceEmotionConfig>,
}

/** Controlls and configures all body detection specific options
 * - enabled: true/false
 * - modelPath: body pose model, can be absolute path or relative to modelBasePath
 * - minConfidence: threshold for discarding a prediction
 * - maxDetected: maximum number of people detected in the input, should be set to the minimum number for performance
*/
export interface BodyConfig {
  enabled: boolean,
  modelPath: string,
  maxDetected: number,
  minConfidence: number,
  skipFrames: number,
}

/** Controlls and configures all hand detection specific options
 * - enabled: true/false
 * - landmarks: detect hand landmarks or just hand boundary box
 * - modelPath: paths for hand detector and hand skeleton models, can be absolute path or relative to modelBasePath
 * - minConfidence: threshold for discarding a prediction
 * - iouThreshold: ammount of overlap between two detected objects before one object is removed
 * - maxDetected: maximum number of hands detected in the input, should be set to the minimum number for performance
 * - rotation: use best-guess rotated hand image or just box with rotation as-is, false means higher performance, but incorrect finger mapping if hand is inverted
*/
export interface HandConfig {
  enabled: boolean,
  rotation: boolean,
  skipFrames: number,
  minConfidence: number,
  iouThreshold: number,
  maxDetected: number,
  landmarks: boolean,
  detector: {
    modelPath?: string,
  },
  skeleton: {
    modelPath?: string,
  },
}

/** Controlls and configures all object detection specific options
 * - enabled: true/false
 * - modelPath: object detection model, can be absolute path or relative to modelBasePath
 * - minConfidence: minimum score that detection must have to return as valid object
 * - iouThreshold: ammount of overlap between two detected objects before one object is removed
 * - maxDetected: maximum number of detections to return
*/
export interface ObjectConfig {
  enabled: boolean,
  modelPath: string,
  minConfidence: number,
  iouThreshold: number,
  maxDetected: number,
  skipFrames: number,
}

/** Controlls and configures all body segmentation module
 * removes background from input containing person
 * if segmentation is enabled it will run as preprocessing task before any other model
 * alternatively leave it disabled and use it on-demand using human.segmentation method which can
 * remove background or replace it with user-provided background
 *
 * - enabled: true/false
 * - modelPath: object detection model, can be absolute path or relative to modelBasePath
*/
export interface SegmentationConfig {
  enabled: boolean,
  modelPath: string,
}

/** Run input through image filters before inference
 * - image filters run with near-zero latency as they are executed on the GPU
*/
export interface FilterConfig {
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
}

/** Controlls gesture detection */
export interface GestureConfig {
  enabled: boolean,
}

/**
 * Configuration interface definition for **Human** library
 *
 * Contains all configurable parameters
 * @typedef Config
 */
export interface Config {
  /** Backend used for TFJS operations */
  backend: '' | 'cpu' | 'wasm' | 'webgl' | 'humangl' | 'tensorflow' | 'webgpu',
  // backend: string;

  /** Path to *.wasm files if backend is set to `wasm` */
  wasmPath: string,

  /** Print debug statements to console */
  debug: boolean,

  /** Perform model loading and inference concurrently or sequentially */
  async: boolean,

  /** What to use for `human.warmup()`
   * - warmup pre-initializes all models for faster inference but can take significant time on startup
   * - only used for `webgl` and `humangl` backends
  */
  warmup: 'none' | 'face' | 'full' | 'body',
  // warmup: string;

  /** Base model path (typically starting with file://, http:// or https://) for all models
   * - individual modelPath values are relative to this path
  */
  modelBasePath: string,

  /** Cache sensitivity
   * - values 0..1 where 0.01 means reset cache if input changed more than 1%
   * - set to 0 to disable caching
  */
  cacheSensitivity: number;

  /** Cache sensitivity
   * - values 0..1 where 0.01 means reset cache if input changed more than 1%
   * - set to 0 to disable caching
  */
  skipFrame: boolean;

  /** Run input through image filters before inference
   * - image filters run with near-zero latency as they are executed on the GPU
  */
  filter: Partial<FilterConfig>,
  // type definition end

  gesture: Partial<GestureConfig>;

  face: Partial<FaceConfig>,

  body: Partial<BodyConfig>,

  hand: Partial<HandConfig>,

  object: Partial<ObjectConfig>,

  segmentation: Partial<SegmentationConfig>,
}

/**
 * [See all default Config values...](https://github.com/vladmandic/human/blob/main/src/config.ts#L244)
 *
 */
const config: Config = {
  backend: '',               // select tfjs backend to use, leave empty to use default backend
                             // can be 'webgl', 'wasm', 'cpu', or 'humangl' which is a custom version of webgl
                             // default set to `humangl` for browsers and `tensorflow` for nodejs
  modelBasePath: '',         // base path for all models
                             // default set to `../models/` for browsers and `file://models/` for nodejs
  wasmPath: '',              // path for wasm binaries, only used for backend: wasm
                             // default set to download from jsdeliv during Human class instantiation
  debug: true,               // print additional status messages to console
  async: true,               // execute enabled models in parallel
  warmup: 'full',            // what to use for human.warmup(), can be 'none', 'face', 'full'
                             // warmup pre-initializes all models for faster inference but can take
                             // significant time on startup
                             // only used for `webgl` and `humangl` backends
  cacheSensitivity: 0.75,    // cache sensitivity
                             // values 0..1 where 0.01 means reset cache if input changed more than 1%
                             // set to 0 to disable caching
  skipFrame: false,          // internal & dynamic
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
    enabled: true,           // enable gesture recognition based on model results
  },

  face: {
    enabled: true,           // controls if specified modul is enabled
                             // face.enabled is required for all face models:
                             // detector, mesh, iris, age, gender, emotion
                             // (note: module is not loaded until it is required)
    detector: {
      modelPath: 'blazeface.json', // detector model, can be absolute path or relative to modelBasePath
      rotation: true,        // use best-guess rotated face image or just box with rotation as-is
                             // false means higher performance, but incorrect mesh mapping if face angle is above 20 degrees
                             // this parameter is not valid in nodejs
      maxDetected: 15,       // maximum number of faces detected in the input
                             // should be set to the minimum number for performance
      skipFrames: 15,        // how many max frames to go without re-running the face bounding box detector
                             // only used when cacheSensitivity is not zero
                             // e.g., if model is running st 25 FPS, we can re-use existing bounding
                             // box for updated face analysis as the head probably hasn't moved much
                             // in short time (10 * 1/25 = 0.25 sec)
      minConfidence: 0.2,    // threshold for discarding a prediction
      iouThreshold: 0.1,     // ammount of overlap between two detected objects before one object is removed
      return: false,         // return extracted face as tensor
                              // in which case user is reponsible for disposing the tensor
    },

    mesh: {
      enabled: true,
      modelPath: 'facemesh.json',  // facemesh model, can be absolute path or relative to modelBasePath
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
      skipFrames: 11,        // how many max frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
      minConfidence: 0.1,    // threshold for discarding a prediction
    },

    emotion: {
      enabled: true,
      minConfidence: 0.1,    // threshold for discarding a prediction
      skipFrames: 17,        // how max many frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
      modelPath: 'emotion.json',  // face emotion model, can be absolute path or relative to modelBasePath
    },
  },

  body: {
    enabled: true,
    modelPath: 'movenet-lightning.json',  // body model, can be absolute path or relative to modelBasePath
                             // can be 'posenet', 'blazepose', 'efficientpose', 'movenet-lightning', 'movenet-thunder'
    maxDetected: 1,          // maximum number of people detected in the input
                             // should be set to the minimum number for performance
                             // only valid for posenet as other models detects single pose
    minConfidence: 0.2,      // threshold for discarding a prediction
    skipFrames: 1,           // how many max frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
},

  hand: {
    enabled: true,
    rotation: true,          // use best-guess rotated hand image or just box with rotation as-is
                             // false means higher performance, but incorrect finger mapping if hand is inverted
    skipFrames: 18,          // how many max frames to go without re-running the hand bounding box detector
                             // only used when cacheSensitivity is not zero
                             // e.g., if model is running st 25 FPS, we can re-use existing bounding
                             // box for updated hand skeleton analysis as the hand probably
                             // hasn't moved much in short time (10 * 1/25 = 0.25 sec)
    minConfidence: 0.8,      // threshold for discarding a prediction
    iouThreshold: 0.2,       // ammount of overlap between two detected objects before one object is removed
    maxDetected: 1,          // maximum number of hands detected in the input
                             // should be set to the minimum number for performance
    landmarks: true,         // detect hand landmarks or just hand boundary box
    detector: {
      modelPath: 'handdetect.json',  // hand detector model, can be absolute path or relative to modelBasePath
    },
    skeleton: {
      modelPath: 'handskeleton.json',  // hand skeleton model, can be absolute path or relative to modelBasePath
    },
  },

  object: {
    enabled: false,
    modelPath: 'mb3-centernet.json',  // experimental: object detection model, can be absolute path or relative to modelBasePath
                             // can be 'mb3-centernet' or 'nanodet'
    minConfidence: 0.2,      // threshold for discarding a prediction
    iouThreshold: 0.4,       // ammount of overlap between two detected objects before one object is removed
    maxDetected: 10,         // maximum number of objects detected in the input
    skipFrames: 19,          // how many max frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
  },

  segmentation: {
    enabled: false,          // controlls and configures all body segmentation module
                             // removes background from input containing person
                             // if segmentation is enabled it will run as preprocessing task before any other model
                             // alternatively leave it disabled and use it on-demand using human.segmentation method which can
                             // remove background or replace it with user-provided background
    modelPath: 'selfie.json',  // experimental: object detection model, can be absolute path or relative to modelBasePath
                             // can be 'selfie' or 'meet'
  },
};
export { config as defaults };
