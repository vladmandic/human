/* eslint-disable indent */
/* eslint-disable no-multi-spaces */

/** Generic config type inherited by all module types */
export interface GenericConfig {
  /** @property is module enabled? */
  enabled: boolean,
  /** @property path to model json file */
  modelPath: string,
  /** @property how many max frames to go without re-running model if cached results are acceptable */
  skipFrames: number,
  /** @property how many max miliseconds to go without re-running model if cached results are acceptable */
  skipTime: number,
}

/** Dectector part of face configuration */
export interface FaceDetectorConfig extends GenericConfig {
  /** @property is face rotation correction performed after detecting face? */
  rotation: boolean,
  /** @property maximum number of detected faces */
  maxDetected: number,
  /** @property minimum confidence for a detected face before results are discarded */
  minConfidence: number,
  /** @property minimum overlap between two detected faces before one is discarded */
  iouThreshold: number,
  /** @property should face detection return face tensor to be used in some other extenrnal model? */
  return: boolean,
}

/** Mesh part of face configuration */
export interface FaceMeshConfig extends GenericConfig {}

/** Iris part of face configuration */
export interface FaceIrisConfig extends GenericConfig {}

/** Description or face embedding part of face configuration
 * - also used by age and gender detection
 */
export interface FaceDescriptionConfig extends GenericConfig {
  /** @property minimum confidence for a detected face before results are discarded */
  minConfidence: number,
}

/** Emotion part of face configuration */
export interface FaceEmotionConfig extends GenericConfig {
  /** @property minimum confidence for a detected face before results are discarded */
  minConfidence: number,
}

/** Anti-spoofing part of face configuration */
export interface FaceAntiSpoofConfig extends GenericConfig {}

/** Configures all face-specific options: face detection, mesh analysis, age, gender, emotion detection and face description */
export interface FaceConfig extends GenericConfig {
  detector: Partial<FaceDetectorConfig>,
  mesh: Partial<FaceMeshConfig>,
  iris: Partial<FaceIrisConfig>,
  description: Partial<FaceDescriptionConfig>,
  emotion: Partial<FaceEmotionConfig>,
  antispoof: Partial<FaceAntiSpoofConfig>,
}

/** Configures all body detection specific options */
export interface BodyConfig extends GenericConfig {
  /** @property maximum numboer of detected bodies */
  maxDetected: number,
  /** @property minimum confidence for a detected body before results are discarded */
  minConfidence: number,
  detector?: {
    /** @property path to optional body detector model json file */
    modelPath: string
  },
}

/** Configures all hand detection specific options */
export interface HandConfig extends GenericConfig {
  /** @property should hand rotation correction be performed after hand detection? */
  rotation: boolean,
  /** @property minimum confidence for a detected hand before results are discarded */
  minConfidence: number,
  /** @property minimum overlap between two detected hands before one is discarded */
  iouThreshold: number,
  /** @property maximum number of detected hands */
  maxDetected: number,
  /** @property should hand landmarks be detected or just return detected hand box */
  landmarks: boolean,
  detector: {
    /** @property path to hand detector model json */
    modelPath?: string,
  },
  skeleton: {
    /** @property path to hand skeleton model json */
    modelPath?: string,
  },
}

/** Configures all object detection specific options */
export interface ObjectConfig extends GenericConfig {
  /** @property minimum confidence for a detected objects before results are discarded */
  minConfidence: number,
  /** @property minimum overlap between two detected objects before one is discarded */
  iouThreshold: number,
  /** @property maximum number of detected objects */
  maxDetected: number,
}

/** Configures all body segmentation module
 * removes background from input containing person
 * if segmentation is enabled it will run as preprocessing task before any other model
 * alternatively leave it disabled and use it on-demand using human.segmentation method which can
 * remove background or replace it with user-provided background
*/
export interface SegmentationConfig extends GenericConfig {
  /** @property blur segmentation output by <number> pixels for more realistic image */
  blur: number,
}

/** Run input through image filters before inference
 * - available only in Browser environments
 * - image filters run with near-zero latency as they are executed on the GPU using WebGL
*/
export interface FilterConfig {
  /** @property are image filters enabled? */
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
  /** @property return processed canvas imagedata in result */
  return: boolean,
  /** @property flip input as mirror image */
  flip: boolean,
  /** @property range: -1 (darken) to 1 (lighten) */
  brightness: number,
  /** @property range: -1 (reduce contrast) to 1 (increase contrast) */
  contrast: number,
  /** @property range: 0 (no sharpening) to 1 (maximum sharpening) */
  sharpness: number,
  /** @property range: 0 (no blur) to N (blur radius in pixels) */
  blur: number
  /** @property range: -1 (reduce saturation) to 1 (increase saturation) */
  saturation: number,
  /** @property range: 0 (no change) to 360 (hue rotation in degrees) */
  hue: number,
  /** @property image negative */
  negative: boolean,
  /** @property image sepia colors */
  sepia: boolean,
  /** @property image vintage colors */
  vintage: boolean,
  /** @property image kodachrome colors */
  kodachrome: boolean,
  /** @property image technicolor colors */
  technicolor: boolean,
  /** @property image polaroid camera effect */
  polaroid: boolean,
  /** @property range: 0 (no pixelate) to N (number of pixels to pixelate) */
  pixelate: number,
}

/** Controlls gesture detection */
export interface GestureConfig {
  /** @property is gesture detection enabled? */
  enabled: boolean,
}

/**
 * Configuration interface definition for **Human** library
 *
 * Contains all configurable parameters
 * @typedef Config
 *
 * Defaults: [config](https://github.com/vladmandic/human/blob/main/src/config.ts#L292)
 */
export interface Config {
  /** Backend used for TFJS operations
   * Valid build-in backends are:
   * - Browser: `cpu`, `wasm`, `webgl`, `humangl`
   * - NodeJS: `cpu`, `wasm`, `tensorflow`
   *
   * Experimental:
   * - Browser: `webgpu` - requires custom build of `tfjs-backend-webgpu`
   *
   * Defaults: `humangl` for browser and `tensorflow` for nodejs
  */
  backend: '' | 'cpu' | 'wasm' | 'webgl' | 'humangl' | 'tensorflow' | 'webgpu',
  // backend: string;

  /** Path to *.wasm files if backend is set to `wasm`
   * - if not set, auto-detects to link to CDN `jsdelivr` when running in browser
  */
  wasmPath: string,

  /** Print debug statements to console */
  debug: boolean,

  /** Perform model loading and inference concurrently or sequentially */
  async: boolean,

  /** What to use for `human.warmup()`
   * - warmup pre-initializes all models for faster inference but can take significant time on startup
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

  /** Internal Variable */
  skipAllowed: boolean;

  /** {@link FilterConfig} */
  filter: Partial<FilterConfig>,

  /** {@link GestureConfig} */
  gesture: Partial<GestureConfig>;

  /** {@link FaceConfig} */
  face: Partial<FaceConfig>,

  /** {@link BodyConfig} */
  body: Partial<BodyConfig>,

  /** {@link HandConfig} */
  hand: Partial<HandConfig>,

  /** {@link ObjectConfig} */
  object: Partial<ObjectConfig>,

  /** {@link SegmentationConfig} */
  segmentation: Partial<SegmentationConfig>,
}

/** - [See all default Config values...](https://github.com/vladmandic/human/blob/main/src/config.ts#L250) */
const config: Config = {
  backend: '',               // select tfjs backend to use, leave empty to use default backend
                             // for browser environments: 'webgl', 'wasm', 'cpu', or 'humangl' (which is a custom version of webgl)
                             // for nodejs environments: 'tensorflow', 'wasm', 'cpu'
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
  cacheSensitivity: 0.70,    // cache sensitivity
                             // values 0..1 where 0.01 means reset cache if input changed more than 1%
                             // set to 0 to disable caching
  skipAllowed: false,        // internal & dynamic
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
      maxDetected: 1,        // maximum number of faces detected in the input
                             // should be set to the minimum number for performance
      skipFrames: 99,        // how many max frames to go without re-running the face bounding box detector
                             // only used when cacheSensitivity is not zero
      skipTime: 2500,        // how many ms to go without re-running the face bounding box detector
                             // only used when cacheSensitivity is not zero
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

    emotion: {
      enabled: true,
      minConfidence: 0.1,    // threshold for discarding a prediction
      skipFrames: 99,        // how max many frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
      skipTime: 1500,        // how many ms to go without re-running the face bounding box detector
                             // only used when cacheSensitivity is not zero
      modelPath: 'emotion.json',  // face emotion model, can be absolute path or relative to modelBasePath
    },

    description: {
      enabled: true,         // to improve accuracy of face description extraction it is
                             // recommended to enable detector.rotation and mesh.enabled
      modelPath: 'faceres.json',  // face description model
                             // can be either absolute path or relative to modelBasePath
      skipFrames: 99,        // how many max frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
      skipTime: 3000,        // how many ms to go without re-running the face bounding box detector
                             // only used when cacheSensitivity is not zero
      minConfidence: 0.1,    // threshold for discarding a prediction
    },

    antispoof: {
      enabled: false,
      skipFrames: 99,        // how max many frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
      skipTime: 4000,        // how many ms to go without re-running the face bounding box detector
                             // only used when cacheSensitivity is not zero
      modelPath: 'antispoof.json',  // face description model
                             // can be either absolute path or relative to modelBasePath
    },
  },

  body: {
    enabled: true,
    modelPath: 'movenet-lightning.json',  // body model, can be absolute path or relative to modelBasePath
                             // can be 'posenet', 'blazepose', 'efficientpose', 'movenet-lightning', 'movenet-thunder'
    detector: {
      modelPath: '',         // optional body detector
    },
    maxDetected: -1,         // maximum number of people detected in the input
                             // should be set to the minimum number for performance
                             // only valid for posenet and movenet-multipose as other models detects single pose
                             // set to -1 to autodetect based on number of detected faces
    minConfidence: 0.3,      // threshold for discarding a prediction
    skipFrames: 1,           // how many max frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
    skipTime: 200,           // how many ms to go without re-running the face bounding box detector
                             // only used when cacheSensitivity is not zero
},

  hand: {
    enabled: true,
    rotation: true,          // use best-guess rotated hand image or just box with rotation as-is
                             // false means higher performance, but incorrect finger mapping if hand is inverted
                             // only valid for `handdetect` variation
    skipFrames: 99,          // how many max frames to go without re-running the hand bounding box detector
                             // only used when cacheSensitivity is not zero
    skipTime: 2000,          // how many ms to go without re-running the face bounding box detector
                             // only used when cacheSensitivity is not zero
    minConfidence: 0.50,     // threshold for discarding a prediction
    iouThreshold: 0.2,       // ammount of overlap between two detected objects before one object is removed
    maxDetected: -1,         // maximum number of hands detected in the input
                             // should be set to the minimum number for performance
                             // set to -1 to autodetect based on number of detected faces
    landmarks: true,         // detect hand landmarks or just hand boundary box
    detector: {
      modelPath: 'handtrack.json',  // hand detector model, can be absolute path or relative to modelBasePath
                             // can be 'handdetect' or 'handtrack'
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
    skipFrames: 99,          // how many max frames to go without re-running the detector
                             // only used when cacheSensitivity is not zero
    skipTime: 1000,          // how many ms to go without re-running object detector
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
    blur: 8,                 // blur segmentation output by n pixels for more realistic image
  },
};

export { config as defaults };
