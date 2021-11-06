/** Generic config type inherited by all module types */
export interface GenericConfig {
    /** @property is module enabled? */
    enabled: boolean;
    /** @property path to model json file */
    modelPath: string;
    /** @property how many max frames to go without re-running model if cached results are acceptable */
    skipFrames: number;
    /** @property how many max miliseconds to go without re-running model if cached results are acceptable */
    skipTime: number;
}
/** Dectector part of face configuration */
export interface FaceDetectorConfig extends GenericConfig {
    /** @property is face rotation correction performed after detecting face? */
    rotation: boolean;
    /** @property maximum number of detected faces */
    maxDetected: number;
    /** @property minimum confidence for a detected face before results are discarded */
    minConfidence: number;
    /** @property minimum overlap between two detected faces before one is discarded */
    iouThreshold: number;
    /** @property should face detection return face tensor to be used in some other extenrnal model? */
    return: boolean;
}
/** Mesh part of face configuration */
export interface FaceMeshConfig extends GenericConfig {
}
/** Iris part of face configuration */
export interface FaceIrisConfig extends GenericConfig {
}
/** Description or face embedding part of face configuration
 * - also used by age and gender detection
 */
export interface FaceDescriptionConfig extends GenericConfig {
    /** @property minimum confidence for a detected face before results are discarded */
    minConfidence: number;
}
/** Emotion part of face configuration */
export interface FaceEmotionConfig extends GenericConfig {
    /** @property minimum confidence for a detected face before results are discarded */
    minConfidence: number;
}
/** Anti-spoofing part of face configuration */
export interface FaceAntiSpoofConfig extends GenericConfig {
}
/** Configures all face-specific options: face detection, mesh analysis, age, gender, emotion detection and face description */
export interface FaceConfig extends GenericConfig {
    detector: Partial<FaceDetectorConfig>;
    mesh: Partial<FaceMeshConfig>;
    iris: Partial<FaceIrisConfig>;
    description: Partial<FaceDescriptionConfig>;
    emotion: Partial<FaceEmotionConfig>;
    antispoof: Partial<FaceAntiSpoofConfig>;
}
/** Configures all body detection specific options */
export interface BodyConfig extends GenericConfig {
    /** @property maximum numboer of detected bodies */
    maxDetected: number;
    /** @property minimum confidence for a detected body before results are discarded */
    minConfidence: number;
    detector?: {
        /** @property path to optional body detector model json file */
        modelPath: string;
    };
}
/** Configures all hand detection specific options */
export interface HandConfig extends GenericConfig {
    /** @property should hand rotation correction be performed after hand detection? */
    rotation: boolean;
    /** @property minimum confidence for a detected hand before results are discarded */
    minConfidence: number;
    /** @property minimum overlap between two detected hands before one is discarded */
    iouThreshold: number;
    /** @property maximum number of detected hands */
    maxDetected: number;
    /** @property should hand landmarks be detected or just return detected hand box */
    landmarks: boolean;
    detector: {
        /** @property path to hand detector model json */
        modelPath?: string;
    };
    skeleton: {
        /** @property path to hand skeleton model json */
        modelPath?: string;
    };
}
/** Configures all object detection specific options */
export interface ObjectConfig extends GenericConfig {
    /** @property minimum confidence for a detected objects before results are discarded */
    minConfidence: number;
    /** @property minimum overlap between two detected objects before one is discarded */
    iouThreshold: number;
    /** @property maximum number of detected objects */
    maxDetected: number;
}
/** Configures all body segmentation module
 * removes background from input containing person
 * if segmentation is enabled it will run as preprocessing task before any other model
 * alternatively leave it disabled and use it on-demand using human.segmentation method which can
 * remove background or replace it with user-provided background
*/
export interface SegmentationConfig extends GenericConfig {
    /** @property blur segmentation output by <number> pixels for more realistic image */
    blur: number;
}
/** Run input through image filters before inference
 * - available only in Browser environments
 * - image filters run with near-zero latency as they are executed on the GPU using WebGL
*/
export interface FilterConfig {
    /** @property are image filters enabled? */
    enabled: boolean;
    /** @property perform image histogram equalization
     * - equalization is performed on input as a whole and detected face before its passed for further analysis
    */
    equalization: boolean;
    /** resize input width
    * - if both width and height are set to 0, there is no resizing
    * - if just one is set, second one is scaled automatically
    * - if both are set, values are used as-is
    * @property
    */
    width: number;
    /** resize input height
    * - if both width and height are set to 0, there is no resizing
    * - if just one is set, second one is scaled automatically
    * - if both are set, values are used as-is
    * @property
    */
    height: number;
    /** @property return processed canvas imagedata in result */
    return: boolean;
    /** @property flip input as mirror image */
    flip: boolean;
    /** @property range: -1 (darken) to 1 (lighten) */
    brightness: number;
    /** @property range: -1 (reduce contrast) to 1 (increase contrast) */
    contrast: number;
    /** @property range: 0 (no sharpening) to 1 (maximum sharpening) */
    sharpness: number;
    /** @property range: 0 (no blur) to N (blur radius in pixels) */
    blur: number;
    /** @property range: -1 (reduce saturation) to 1 (increase saturation) */
    saturation: number;
    /** @property range: 0 (no change) to 360 (hue rotation in degrees) */
    hue: number;
    /** @property image negative */
    negative: boolean;
    /** @property image sepia colors */
    sepia: boolean;
    /** @property image vintage colors */
    vintage: boolean;
    /** @property image kodachrome colors */
    kodachrome: boolean;
    /** @property image technicolor colors */
    technicolor: boolean;
    /** @property image polaroid camera effect */
    polaroid: boolean;
    /** @property range: 0 (no pixelate) to N (number of pixels to pixelate) */
    pixelate: number;
}
/** Controlls gesture detection */
export interface GestureConfig {
    /** @property is gesture detection enabled? */
    enabled: boolean;
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
     * valid build-in backends are:
     * - Browser: `cpu`, `wasm`, `webgl`, `humangl`, `webgpu`
     * - NodeJS: `cpu`, `wasm`, `tensorflow`
     * default: `humangl` for browser and `tensorflow` for nodejs
    */
    backend: '' | 'cpu' | 'wasm' | 'webgl' | 'humangl' | 'tensorflow' | 'webgpu';
    /** Path to *.wasm files if backend is set to `wasm`
     * default: auto-detects to link to CDN `jsdelivr` when running in browser
    */
    wasmPath: string;
    /** Print debug statements to console
     * default: `true`
    */
    debug: boolean;
    /** Perform model loading and inference concurrently or sequentially
     * default: `true`
    */
    async: boolean;
    /** What to use for `human.warmup()`
     * - warmup pre-initializes all models for faster inference but can take significant time on startup
     * - used by `webgl`, `humangl` and `webgpu` backends
     * default: `full`
    */
    warmup: 'none' | 'face' | 'full' | 'body';
    /** Base model path (typically starting with file://, http:// or https://) for all models
     * - individual modelPath values are relative to this path
     * default: `../models/` for browsers and `file://models/` for nodejs
    */
    modelBasePath: string;
    /** Cache sensitivity
     * - values 0..1 where 0.01 means reset cache if input changed more than 1%
     * - set to 0 to disable caching
     * default: 0.7
    */
    cacheSensitivity: number;
    /** Perform immediate garbage collection on deallocated tensors instead of caching them */
    deallocate: boolean;
    /** Internal Variable */
    skipAllowed: boolean;
    /** {@link FilterConfig} */
    filter: Partial<FilterConfig>;
    /** {@link GestureConfig} */
    gesture: Partial<GestureConfig>;
    /** {@link FaceConfig} */
    face: Partial<FaceConfig>;
    /** {@link BodyConfig} */
    body: Partial<BodyConfig>;
    /** {@link HandConfig} */
    hand: Partial<HandConfig>;
    /** {@link ObjectConfig} */
    object: Partial<ObjectConfig>;
    /** {@link SegmentationConfig} */
    segmentation: Partial<SegmentationConfig>;
}
/** - [See all default Config values...](https://github.com/vladmandic/human/blob/main/src/config.ts#L253) */
declare const config: Config;
export { config as defaults };
