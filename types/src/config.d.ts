export interface FaceDetectorConfig {
    modelPath: string;
    rotation: boolean;
    maxDetected: number;
    skipFrames: number;
    minConfidence: number;
    iouThreshold: number;
    return: boolean;
}
export interface FaceMeshConfig {
    enabled: boolean;
    modelPath: string;
}
export interface FaceIrisConfig {
    enabled: boolean;
    modelPath: string;
}
export interface FaceDescriptionConfig {
    enabled: boolean;
    modelPath: string;
    skipFrames: number;
    minConfidence: number;
}
export interface FaceEmotionConfig {
    enabled: boolean;
    minConfidence: number;
    skipFrames: number;
    modelPath: string;
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
    enabled: boolean;
    detector: Partial<FaceDetectorConfig>;
    mesh: Partial<FaceMeshConfig>;
    iris: Partial<FaceIrisConfig>;
    description: Partial<FaceDescriptionConfig>;
    emotion: Partial<FaceEmotionConfig>;
}
/** Controlls and configures all body detection specific options
 * - enabled: true/false
 * - modelPath: body pose model, can be absolute path or relative to modelBasePath
 * - minConfidence: threshold for discarding a prediction
 * - maxDetected: maximum number of people detected in the input, should be set to the minimum number for performance
*/
export interface BodyConfig {
    enabled: boolean;
    modelPath: string;
    maxDetected: number;
    minConfidence: number;
    skipFrames: number;
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
    enabled: boolean;
    rotation: boolean;
    skipFrames: number;
    minConfidence: number;
    iouThreshold: number;
    maxDetected: number;
    landmarks: boolean;
    detector: {
        modelPath?: string;
    };
    skeleton: {
        modelPath?: string;
    };
}
/** Controlls and configures all object detection specific options
 * - enabled: true/false
 * - modelPath: object detection model, can be absolute path or relative to modelBasePath
 * - minConfidence: minimum score that detection must have to return as valid object
 * - iouThreshold: ammount of overlap between two detected objects before one object is removed
 * - maxDetected: maximum number of detections to return
*/
export interface ObjectConfig {
    enabled: boolean;
    modelPath: string;
    minConfidence: number;
    iouThreshold: number;
    maxDetected: number;
    skipFrames: number;
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
    enabled: boolean;
    modelPath: string;
}
/** Run input through image filters before inference
 * - image filters run with near-zero latency as they are executed on the GPU
*/
export interface FilterConfig {
    enabled: boolean;
    /** Resize input width
    * - if both width and height are set to 0, there is no resizing
    * - if just one is set, second one is scaled automatically
    * - if both are set, values are used as-is
    */
    width: number;
    /** Resize input height
    * - if both width and height are set to 0, there is no resizing
    * - if just one is set, second one is scaled automatically
    * - if both are set, values are used as-is
    */
    height: number;
    /** Return processed canvas imagedata in result */
    return: boolean;
    /** Flip input as mirror image */
    flip: boolean;
    /** Range: -1 (darken) to 1 (lighten) */
    brightness: number;
    /** Range: -1 (reduce contrast) to 1 (increase contrast) */
    contrast: number;
    /** Range: 0 (no sharpening) to 1 (maximum sharpening) */
    sharpness: number;
    /** Range: 0 (no blur) to N (blur radius in pixels) */
    blur: number;
    /** Range: -1 (reduce saturation) to 1 (increase saturation) */
    saturation: number;
    /** Range: 0 (no change) to 360 (hue rotation in degrees) */
    hue: number;
    /** Image negative */
    negative: boolean;
    /** Image sepia colors */
    sepia: boolean;
    /** Image vintage colors */
    vintage: boolean;
    /** Image kodachrome colors */
    kodachrome: boolean;
    /** Image technicolor colors */
    technicolor: boolean;
    /** Image polaroid camera effect */
    polaroid: boolean;
    /** Range: 0 (no pixelate) to N (number of pixels to pixelate) */
    pixelate: number;
}
/** Controlls gesture detection */
export interface GestureConfig {
    enabled: boolean;
}
/**
 * Configuration interface definition for **Human** library
 *
 * Contains all configurable parameters
 * @typedef Config
 */
export interface Config {
    /** Backend used for TFJS operations */
    backend: '' | 'cpu' | 'wasm' | 'webgl' | 'humangl' | 'tensorflow' | 'webgpu';
    /** Path to *.wasm files if backend is set to `wasm` */
    wasmPath: string;
    /** Print debug statements to console */
    debug: boolean;
    /** Perform model loading and inference concurrently or sequentially */
    async: boolean;
    /** What to use for `human.warmup()`
     * - warmup pre-initializes all models for faster inference but can take significant time on startup
     * - only used for `webgl` and `humangl` backends
    */
    warmup: 'none' | 'face' | 'full' | 'body';
    /** Base model path (typically starting with file://, http:// or https://) for all models
     * - individual modelPath values are relative to this path
    */
    modelBasePath: string;
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
    filter: Partial<FilterConfig>;
    gesture: Partial<GestureConfig>;
    face: Partial<FaceConfig>;
    body: Partial<BodyConfig>;
    hand: Partial<HandConfig>;
    object: Partial<ObjectConfig>;
    segmentation: Partial<SegmentationConfig>;
}
/**
 * [See all default Config values...](https://github.com/vladmandic/human/blob/main/src/config.ts#L244)
 *
 */
declare const config: Config;
export { config as defaults };
//# sourceMappingURL=config.d.ts.map