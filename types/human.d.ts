import { GraphModel } from '@tensorflow/tfjs-converter';
import { Rank } from '@tensorflow/tfjs-core';
import { Tensor } from '@tensorflow/tfjs-core';
import { Tensor1D } from '@tensorflow/tfjs-core';
import { Tensor2D } from '@tensorflow/tfjs-core';
import { Tensor3D } from '@tensorflow/tfjs-core';
import { Tensor4D } from '@tensorflow/tfjs-core';
import { TensorLike } from '@tensorflow/tfjs-core';

/** meta-function that performs draw for: canvas, face, body, hand */
declare function all(inCanvas: AnyCanvas, result: Result, drawOptions?: Partial<DrawOptions>): Promise<[void, void, void, void, void] | null>;

/** Defines all possible canvas types */
export declare type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

/** Defines all possible image types */
export declare type AnyImage = HTMLImageElement | typeof Image;

/** Defines all possible video types */
export declare type AnyVideo = HTMLMediaElement | HTMLVideoElement;

/** Possible TensorFlow backends */
export declare type BackendEnum = '' | 'cpu' | 'wasm' | 'webgl' | 'humangl' | 'tensorflow' | 'webgpu' | 'none';

/** draw detected bodies */
declare function body(inCanvas: AnyCanvas, result: BodyResult[], drawOptions?: Partial<DrawOptions>): void;

export declare type BodyAnnotation = BodyAnnotationBlazePose | BodyAnnotationEfficientPose;

export declare type BodyAnnotationBlazePose = 'leftLeg' | 'rightLeg' | 'torso' | 'leftArm' | 'rightArm' | 'leftEye' | 'rightEye' | 'mouth';

export declare type BodyAnnotationEfficientPose = 'leftLeg' | 'rightLeg' | 'torso' | 'leftArm' | 'rightArm' | 'head';

/** Configures all body detection specific options */
export declare interface BodyConfig extends GenericConfig {
    /** maximum number of detected bodies */
    maxDetected: number;
    /** minimum confidence for a detected body before results are discarded */
    minConfidence: number;
}

/** body gesture type */
export declare type BodyGesture = `leaning ${'left' | 'right'}` | `raise ${'left' | 'right'} hand` | 'i give up';

/** Body Result keypoints */
export declare interface BodyKeypoint {
    /** body part name */
    part: BodyLandmark;
    /** body part position */
    position: Point;
    /** body part position normalized to 0..1 */
    positionRaw: Point;
    /** body part position relative to body center in meters */
    distance?: Point;
    /** body part detection score */
    score: number;
}

export declare type BodyLandmark = BodyLandmarkPoseNet | BodyLandmarkMoveNet | BodyLandmarkEfficientNet | BodyLandmarkBlazePose;

export declare type BodyLandmarkBlazePose = 'nose' | 'leftEyeInside' | 'leftEye' | 'leftEyeOutside' | 'rightEyeInside' | 'rightEye' | 'rightEyeOutside' | 'leftEar' | 'rightEar' | 'leftMouth' | 'rightMouth' | 'leftShoulder' | 'rightShoulder' | 'leftElbow' | 'rightElbow' | 'leftWrist' | 'rightWrist' | 'leftPinky' | 'rightPinky' | 'leftIndex' | 'rightIndex' | 'leftThumb' | 'rightThumb' | 'leftHip' | 'rightHip' | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle' | 'leftHeel' | 'rightHeel' | 'leftFoot' | 'rightFoot' | 'bodyCenter' | 'bodyTop' | 'leftPalm' | 'leftHand' | 'rightPalm' | 'rightHand';

export declare type BodyLandmarkEfficientNet = 'head' | 'neck' | 'rightShoulder' | 'rightElbow' | 'rightWrist' | 'chest' | 'leftShoulder' | 'leftElbow' | 'leftWrist' | 'bodyCenter' | 'rightHip' | 'rightKnee' | 'rightAnkle' | 'leftHip' | 'leftKnee' | 'leftAnkle';

export declare type BodyLandmarkMoveNet = 'nose' | 'leftEye' | 'rightEye' | 'leftEar' | 'rightEar' | 'leftShoulder' | 'rightShoulder' | 'leftElbow' | 'rightElbow' | 'leftWrist' | 'rightWrist' | 'leftHip' | 'rightHip' | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle';

export declare type BodyLandmarkPoseNet = 'nose' | 'leftEye' | 'rightEye' | 'leftEar' | 'rightEar' | 'leftShoulder' | 'rightShoulder' | 'leftElbow' | 'rightElbow' | 'leftWrist' | 'rightWrist' | 'leftHip' | 'rightHip' | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle';

/** Body results */
export declare interface BodyResult {
    /** body id */
    id: number;
    /** body detection score */
    score: number;
    /** detected body box */
    box: Box;
    /** detected body box normalized to 0..1 */
    boxRaw: Box;
    /** detected body keypoints */
    keypoints: BodyKeypoint[];
    /** detected body keypoints combined into annotated parts */
    annotations: Record<BodyAnnotation, Point[][]>;
}

/** generic box as [x, y, width, height] */
export declare type Box = [number, number, number, number];

/** draw processed canvas */
declare function canvas(input: AnyCanvas | HTMLImageElement | HTMLVideoElement, output: AnyCanvas): void;

/**
 * Configuration interface definition for **Human** library
 * Contains all configurable parameters
 * Defaults: [config](https://github.com/vladmandic/human/blob/main/src/config.ts#L262)
 */
export declare interface Config {
    /** Backend used for TFJS operations
     * valid build-in backends are:
     * - Browser: `cpu`, `wasm`, `webgl`, `humangl`, `webgpu`
     * - NodeJS: `cpu`, `wasm`, `tensorflow`
     * default: `webgl` for browser and `tensorflow` for nodejs
     */
    backend: BackendEnum;
    /** Path to *.wasm files if backend is set to `wasm`
     *
     * default: auto-detects to link to CDN `jsdelivr` when running in browser
     */
    wasmPath: string;
    /** Force WASM loader to use platform fetch
     *
     * default: false
     */
    wasmPlatformFetch: boolean;
    /** Print debug statements to console
     *
     * default: `true`
     */
    debug: boolean;
    /** Perform model loading and inference concurrently or sequentially
     *
     * default: `true`
     */
    async: boolean;
    /** What to use for `human.warmup()`
     * - warmup pre-initializes all models for faster inference but can take significant time on startup
     * - used by `webgl`, `humangl` and `webgpu` backends
     *
     * default: `full`
     */
    warmup: WarmupEnum;
    /** Base model path (typically starting with file://, http:// or https://) for all models
     * - individual modelPath values are relative to this path
     *
     * default: `../models/` for browsers and `file://models/` for nodejs
     */
    modelBasePath: string;
    /** Cache models in IndexDB on first sucessfull load
     * default: true if indexdb is available (browsers), false if its not (nodejs)
     */
    cacheModels: boolean;
    /** Validate kernel ops used in model during model load
     * default: true
     * any errors will be printed on console but will be treated as non-fatal
     */
    validateModels: boolean;
    /** Cache sensitivity
     * - values 0..1 where 0.01 means reset cache if input changed more than 1%
     * - set to 0 to disable caching
     *
     * default: 0.7
     */
    cacheSensitivity: number;
    /** Explicit flags passed to initialize TFJS */
    flags: Record<string, unknown>;
    /** Software Kernels
     * Registers software kernel ops running on CPU when accelerated version of kernel is not found in the current backend
     */
    softwareKernels: boolean;
    /** Perform immediate garbage collection on deallocated tensors instead of caching them */
    deallocate: boolean;
    /** Internal Variable */
    skipAllowed: boolean;
    /** Filter config {@link FilterConfig} */
    filter: Partial<FilterConfig>;
    /** Gesture config {@link GestureConfig} */
    gesture: Partial<GestureConfig>;
    /** Face config {@link FaceConfig} */
    face: Partial<FaceConfig>;
    /** Body config {@link BodyConfig} */
    body: Partial<BodyConfig>;
    /** Hand config {@link HandConfig} */
    hand: Partial<HandConfig>;
    /** Object config {@link ObjectConfig} */
    object: Partial<ObjectConfig>;
    /** Segmentation config {@link SegmentationConfig} */
    segmentation: Partial<SegmentationConfig>;
}

/** - [See all default Config values...](https://github.com/vladmandic/human/blob/main/src/config.ts#L262) */
export declare const defaults: Config;

/** Face descriptor type as number array */
declare type Descriptor = number[];

/** Calculates distance between two descriptors
 * @param options - calculation options
 * - order - algorithm to use
 *   Euclidean distance if `order` is 2 (default), Minkowski distance algorithm of nth order if `order` is higher than 2
 * - multiplier - by how much to enhance difference analysis in range of 1..100
 *   default is 20 which normalizes results to similarity above 0.5 can be considered a match
 */
declare function distance(descriptor1: Descriptor, descriptor2: Descriptor, options?: MatchOptions): number;

declare namespace draw {
    export {
        person,
        canvas,
        tensor,
        all,
        init,
        options,
        face,
        body,
        hand,
        object,
        gesture
    }
}
export { draw }

/** Draw Options
 * - Accessed via `human.draw.options` or provided per each draw method as the drawOptions optional parameter
 */
export declare interface DrawOptions {
    /** draw line color */
    color: string;
    /** alpha value used for lines */
    alpha: number;
    /** label color */
    labelColor: string;
    /** label shadow color */
    shadowColor: string;
    /** label font */
    font: string;
    /** line spacing between labels */
    lineHeight: number;
    /** line width for drawn lines */
    lineWidth: number;
    /** size of drawn points */
    pointSize: number;
    /** draw rounded boxes by n pixels */
    roundRect: number;
    /** should points be drawn? */
    drawPoints: boolean;
    /** should labels be drawn? */
    drawLabels: boolean;
    /** should face attention keypoints be highlighted */
    drawAttention: boolean;
    /** should detected gestures be drawn? */
    drawGestures: boolean;
    /** should draw boxes around detection results? */
    drawBoxes: boolean;
    /** should draw polygons from detection points? */
    drawPolygons: boolean;
    /** should draw gaze arrows? */
    drawGaze: boolean;
    /** should fill polygons? */
    fillPolygons: boolean;
    /** use z-coordinate when available */
    useDepth: boolean;
    /** should lines be curved? */
    useCurves: boolean;
    /** string template for face labels */
    faceLabels: string;
    /** string template for body labels */
    bodyLabels: string;
    /** string template for body part labels */
    bodyPartLabels: string;
    /** string template for hand labels */
    handLabels: string;
    /** string template for hand labels */
    fingerLabels: string;
    /** string template for object labels */
    objectLabels: string;
    /** string template for gesture labels */
    gestureLabels: string;
}

export declare type Emotion = 'angry' | 'disgust' | 'fear' | 'happy' | 'sad' | 'surprise' | 'neutral';

export declare const empty: (error?: string | null) => Result;

/** Env class that holds detected capabilities */
export declare class Env {
    #private;
    /** Running in Browser */
    browser: boolean;
    /** Running in NodeJS */
    node: boolean;
    /** Running in WebWorker thread */
    worker: boolean;
    /** Detected platform */
    platform: string;
    /** Detected agent */
    agent: string;
    /** List of supported backends */
    backends: string[];
    /** Has any work been performed so far */
    initial: boolean;
    /** Are image filters supported? */
    filter: boolean | undefined;
    /** TFJS instance details */
    tfjs: {
        version: undefined | string;
    };
    /** Is offscreenCanvas supported? */
    offscreen: undefined | boolean;
    /** Are performance counter instant values or additive */
    perfadd: boolean;
    /** If using tfjs-node get version of underlying tensorflow shared library and if gpu acceleration is enabled */
    tensorflow: {
        version: undefined | string;
        gpu: undefined | boolean;
    };
    /** WASM detected capabilities */
    wasm: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        simd: undefined | boolean;
        multithread: undefined | boolean;
    };
    /** WebGL detected capabilities */
    webgl: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        version: undefined | string;
        renderer: undefined | string;
        shader: undefined | string;
        vendor: undefined | string;
    };
    /** WebGPU detected capabilities */
    webgpu: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        adapter: undefined | GPUAdapterInfo;
    };
    /** CPU info */
    cpu: {
        model: undefined | string;
        flags: string[];
    };
    /** List of supported kernels for current backend */
    kernels: string[];
    get Canvas(): undefined;
    set Canvas(val: undefined);
    get Image(): undefined;
    set Image(val: undefined);
    get ImageData(): undefined;
    set ImageData(val: undefined);
    constructor();
    /** update backend information */
    updateBackend(): Promise<void>;
    /** update cpu information */
    updateCPU(): void;
}

export declare const env: Env;

/** Events dispatched by `human.events`
 * - `create`: triggered when Human object is instantiated
 * - `load`: triggered when models are loaded (explicitly or on-demand)
 * - `image`: triggered when input image is processed
 * - `result`: triggered when detection is complete
 * - `warmup`: triggered when warmup is complete
 */
export declare type Events = 'create' | 'load' | 'image' | 'result' | 'warmup' | 'error';

/** Defines possible externally defined canvas */
export declare type ExternalCanvas = typeof env.Canvas;

/** draw detected faces */
declare function face(inCanvas: AnyCanvas, result: FaceResult[], drawOptions?: Partial<DrawOptions>): void;

/** Anti-spoofing part of face configuration */
export declare interface FaceAntiSpoofConfig extends GenericConfig {
}

/** Attention part of face configuration */
export declare interface FaceAttentionConfig extends GenericConfig {
}

/** Configures all face-specific options: face detection, mesh analysis, age, gender, emotion detection and face description */
export declare interface FaceConfig extends GenericConfig {
    detector: Partial<FaceDetectorConfig>;
    mesh: Partial<FaceMeshConfig>;
    attention: Partial<FaceAttentionConfig>;
    iris: Partial<FaceIrisConfig>;
    description: Partial<FaceDescriptionConfig>;
    emotion: Partial<FaceEmotionConfig>;
    antispoof: Partial<FaceAntiSpoofConfig>;
    liveness: Partial<FaceLivenessConfig>;
    gear: Partial<FaceGearConfig>;
}

/** Description or face embedding part of face configuration
 * - also used by age and gender detection
 */
export declare interface FaceDescriptionConfig extends GenericConfig {
    /** minimum confidence for a detected face before results are discarded */
    minConfidence: number;
}

/** Detector part of face configuration */
export declare interface FaceDetectorConfig extends GenericConfig {
    /** is face rotation correction performed after detecting face?
     * used to correctly analyze faces under high angles
     */
    rotation: boolean;
    /** maximum number of detected faces */
    maxDetected: number;
    /** minimum confidence for a detected face before results are discarded */
    minConfidence: number;
    /** minimum size in pixels of a detected face box before resutls are discared */
    minSize: number;
    /** minimum overlap between two detected faces before one is discarded */
    iouThreshold: number;
    /** how much should face box be enlarged over the min/max facial coordinates */
    scale: number;
    /** automatically pad image to square */
    square: boolean;
    /** should child models perform on masked image of a face */
    mask: boolean;
    /** should face detection return processed and cropped face tensor that can with an external model for addtional processing?
     * if enabled it must be manually deallocated to avoid memory leak */
    return: boolean;
}

/** Emotion part of face configuration */
export declare interface FaceEmotionConfig extends GenericConfig {
    /** minimum confidence for a detected face before results are discarded */
    minConfidence: number;
}

/** Gear part of face configuration */
export declare interface FaceGearConfig extends GenericConfig {
    /** minimum confidence for a detected race before results are discarded */
    minConfidence: number;
}

/** face gesture type */
export declare type FaceGesture = `facing ${'left' | 'center' | 'right'}` | `blink ${'left' | 'right'} eye` | `mouth ${number}% open` | `head ${'up' | 'down'}`;

/** Iris part of face configuration */
export declare interface FaceIrisConfig extends GenericConfig {
    /** how much should iris box be enlarged over the min/max iris coordinates */
    scale: number;
}

export declare type FaceLandmark = 'leftEye' | 'rightEye' | 'nose' | 'mouth' | 'leftEar' | 'rightEar' | 'symmetryLine' | 'silhouette' | 'lipsUpperOuter' | 'lipsLowerOuter' | 'lipsUpperInner' | 'lipsLowerInner' | 'rightEyeUpper0' | 'rightEyeLower0' | 'rightEyeUpper1' | 'rightEyeLower1' | 'rightEyeUpper2' | 'rightEyeLower2' | 'rightEyeLower3' | 'rightEyebrowUpper' | 'rightEyebrowLower' | 'rightEyeIris' | 'leftEyeUpper0' | 'leftEyeLower0' | 'leftEyeUpper1' | 'leftEyeLower1' | 'leftEyeUpper2' | 'leftEyeLower2' | 'leftEyeLower3' | 'leftEyebrowUpper' | 'leftEyebrowLower' | 'leftEyeIris' | 'midwayBetweenEyes' | 'noseTip' | 'noseBottom' | 'noseRightCorner' | 'noseLeftCorner' | 'rightCheek' | 'leftCheek';

/** Liveness part of face configuration */
export declare interface FaceLivenessConfig extends GenericConfig {
}

/** Mesh part of face configuration */
export declare interface FaceMeshConfig extends GenericConfig {
    /** Keep detected faces that cannot be verified using facemesh */
    keepInvalid: boolean;
}

/** Face results
 * - Combined results of face detector, face mesh, age, gender, emotion, embedding, iris models
 * - Some values may be null if specific model is not enabled
 */
export declare interface FaceResult {
    /** face id */
    id: number;
    /** overall face score */
    score: number;
    /** detection score */
    boxScore: number;
    /** mesh score */
    faceScore: number;
    /** detected face box */
    box: Box;
    /** detected face box normalized to 0..1 */
    boxRaw: Box;
    /** detected face box size */
    size: [number, number];
    /** detected face mesh */
    mesh: Point[];
    /** detected face mesh normalized to 0..1 */
    meshRaw: Point[];
    /** face contours as array of 2d points normalized to 0..1 */
    /** face contours as array of 2d points */
    /** mesh keypoints combined into annotated results */
    annotations: Record<FaceLandmark, Point[]>;
    /** detected age */
    age?: number;
    /** detected gender */
    gender?: Gender;
    /** gender detection score */
    genderScore?: number;
    /** detected emotions */
    emotion?: {
        score: number;
        emotion: Emotion;
    }[];
    /** detected race */
    race?: {
        score: number;
        race: Race;
    }[];
    /** face descriptor */
    embedding?: number[];
    /** face distance from camera */
    distance?: number;
    /** face anti-spoofing result confidence */
    real?: number;
    /** face liveness result confidence */
    live?: number;
    /** face rotation details */
    rotation?: {
        angle: {
            roll: number;
            yaw: number;
            pitch: number;
        };
        matrix: [number, number, number, number, number, number, number, number, number];
        gaze: {
            bearing: number;
            strength: number;
        };
    } | null;
    /** detected face as tensor that can be used in further pipelines */
    tensor?: Tensor;
}

/** Run input through image filters before inference
 * - available only in Browser environments
 * - image filters run with near-zero latency as they are executed on the GPU using WebGL
 */
export declare interface FilterConfig {
    /** are image filters enabled? */
    enabled: boolean;
    /** perform image histogram equalization
     * - equalization is performed on input as a whole and detected face before its passed for further analysis
     */
    equalization: boolean;
    /** resize input width
     * - if both width and height are set to 0, there is no resizing
     * - if just one is set, second one is scaled automatically
     * - if both are set, values are used as-is
     */
    width: number;
    /** resize input height
     * - if both width and height are set to 0, there is no resizing
     * - if just one is set, second one is scaled automatically
     * - if both are set, values are used as-is
     */
    height: number;
    /** return processed canvas imagedata in result */
    return: boolean;
    /** flip input as mirror image */
    flip: boolean;
    /** apply auto-brighness */
    autoBrightness: boolean;
    /** range: -1 (darken) to 1 (lighten) */
    brightness: number;
    /** range: -1 (reduce contrast) to 1 (increase contrast) */
    contrast: number;
    /** range: 0 (no sharpening) to 1 (maximum sharpening) */
    sharpness: number;
    /** range: 0 (no blur) to N (blur radius in pixels) */
    blur: number;
    /** range: -1 (reduce saturation) to 1 (increase saturation) */
    saturation: number;
    /** range: 0 (no change) to 360 (hue rotation in degrees) */
    hue: number;
    /** image negative */
    negative: boolean;
    /** image sepia colors */
    sepia: boolean;
    /** image vintage colors */
    vintage: boolean;
    /** image kodachrome colors */
    kodachrome: boolean;
    /** image technicolor colors */
    technicolor: boolean;
    /** image polaroid camera effect */
    polaroid: boolean;
    /** range: 0 (no pixelate) to N (number of pixels to pixelate) */
    pixelate: number;
}

/** Matches given descriptor to a closest entry in array of descriptors
 * @param descriptor - face descriptor
 * @param descriptors - array of face descriptors to commpare given descriptor to
 * @param options - see `similarity` method for options description
 * Returns
 * - `index` index array index where best match was found or -1 if no matches
 * - `distance` calculated `distance` of given descriptor to the best match
 * - `similarity` calculated normalized `similarity` of given descriptor to the best match
 */
declare function find(descriptor: Descriptor, descriptors: Descriptor[], options?: MatchOptions): {
    index: number;
    distance: number;
    similarity: number;
};

export declare type Finger = 'index' | 'middle' | 'pinky' | 'ring' | 'thumb' | 'palm';

export declare type FingerCurl = 'none' | 'half' | 'full';

export declare type FingerDirection = 'verticalUp' | 'verticalDown' | 'horizontalLeft' | 'horizontalRight' | 'diagonalUpRight' | 'diagonalUpLeft' | 'diagonalDownRight' | 'diagonalDownLeft';

export declare type Gender = 'male' | 'female' | 'unknown';

/** Generic config type inherited by all module types */
export declare interface GenericConfig {
    /** is module enabled? */
    enabled: boolean;
    /** path to model json file (relative to `modelBasePath` */
    modelPath: string;
    /** how many max frames to go without re-running model if cached results are acceptable
     * for two-phase models such as face and hand caching applies to bounding boxes detection only */
    skipFrames: number;
    /** how many max milliseconds to go without re-running model if cached results are acceptable
     * for two-phase models such as face and hand caching applies to bounding boxes detection only */
    skipTime: number;
}

/** draw detected gestures */
declare function gesture(inCanvas: AnyCanvas, result: GestureResult[], drawOptions?: Partial<DrawOptions>): void;

/** Controlls gesture detection */
export declare interface GestureConfig {
    /** is gesture detection enabled? */
    enabled: boolean;
}

/** Gesture combined results
 * Each result has:
 * - part: part name and number where gesture was detected: `face`, `iris`, `body`, `hand`
 * - gesture: gesture detected
 */
export declare type GestureResult = {
    'face': number;
    gesture: FaceGesture;
} | {
    'iris': number;
    gesture: IrisGesture;
} | {
    'body': number;
    gesture: BodyGesture;
} | {
    'hand': number;
    gesture: HandGesture;
};

export { GraphModel }

/** draw detected hands */
declare function hand(inCanvas: AnyCanvas, result: HandResult[], drawOptions?: Partial<DrawOptions>): void;

/** Configures all hand detection specific options */
export declare interface HandConfig extends GenericConfig {
    /** should hand rotation correction be performed after hand detection? */
    rotation: boolean;
    /** minimum confidence for a detected hand before results are discarded */
    minConfidence: number;
    /** minimum overlap between two detected hands before one is discarded */
    iouThreshold: number;
    /** maximum number of detected hands */
    maxDetected: number;
    /** should hand landmarks be detected or just return detected hand box */
    landmarks: boolean;
    detector: {
        /** path to hand detector model json */
        modelPath?: string;
    };
    skeleton: {
        /** path to hand skeleton model json */
        modelPath?: string;
    };
}

/** hand gesture type */
export declare type HandGesture = `${'thumb' | 'index' | 'middle' | 'ring' | 'pinky'} forward` | `${'thumb' | 'index' | 'middle' | 'ring' | 'pinky'} up` | 'victory' | 'thumbs up';

/** Hand results */
export declare interface HandResult {
    /** hand id */
    id: number;
    /** hand overal score */
    score: number;
    /** hand detection score */
    boxScore: number;
    /** hand skelton score */
    fingerScore: number;
    /** detected hand box */
    box: Box;
    /** detected hand box normalized to 0..1 */
    boxRaw: Box;
    /** detected hand keypoints */
    keypoints: Point[];
    /** detected hand class */
    label: HandType;
    /** detected hand keypoints combined into annotated parts */
    annotations: Record<Finger, Point[]>;
    /** detected hand parts annotated with part gestures */
    landmarks: Record<Finger, {
        curl: FingerCurl;
        direction: FingerDirection;
    }>;
}

export declare type HandType = 'hand' | 'fist' | 'pinch' | 'point' | 'face' | 'tip' | 'pinchtip';

/** **Human** library main class
 *
 * All methods and properties are available only as members of Human class
 *
 * - Configuration object definition: {@link Config}
 * - Results object definition: {@link Result}
 * - Possible inputs: {@link Input}
 *
 * @param userConfig - {@link Config}
 * @returns instance of {@link Human}
 */
declare class Human {
    #private;
    /** Current version of Human library in *semver* format */
    version: string;
    /** Current configuration
     * - Defaults: [config](https://github.com/vladmandic/human/blob/main/src/config.ts#L262)
     */
    config: Config;
    /** Last known result of detect run
     * - Can be accessed anytime after initial detection
     */
    result: Result;
    /** Current state of Human library
     * - Can be polled to determine operations that are currently executed
     * - Progresses through: 'config', 'check', 'backend', 'load', 'run:<model>', 'idle'
     */
    state: string;
    /** currenty processed image tensor and canvas */
    process: {
        tensor: Tensor | null;
        canvas: AnyCanvas | null;
    };
    /** Instance of TensorFlow/JS used by Human
     *  - Can be embedded or externally provided
     * [TFJS API](https://js.tensorflow.org/api/latest/)
     */
    tf: any;
    /** Object containing environment information used for diagnostics */
    env: Env;
    /** Draw helper classes that can draw detected objects on canvas using specified draw
     * - canvas: draws input to canvas
     * - options: are global settings for all draw operations, can be overriden for each draw method {@link DrawOptions}
     * - face, body, hand, gesture, object, person: draws detected results as overlays on canvas
     */
    draw: typeof draw;
    /** Face Matching
     * - similarity: compare two face descriptors and return similarity index
     * - distance: compare two face descriptors and return raw calculated differences
     * - find: compare face descriptor to array of face descriptors and return best match
     */
    match: typeof match;
    /** Currently loaded models
     * @internal
     * {@link models#Models}
     */
    models: models.Models;
    /** Container for events dispatched by Human
     * Possible events:
     * - `create`: triggered when Human object is instantiated
     * - `load`: triggered when models are loaded (explicitly or on-demand)
     * - `image`: triggered when input image is processed
     * - `result`: triggered when detection is complete
     * - `warmup`: triggered when warmup is complete
     * - `error`: triggered on some errors
     */
    events: EventTarget | undefined;
    /** Reference face triangualtion array of 468 points, used for triangle references between points */
    faceTriangulation: number[];
    /** Refernce UV map of 468 values, used for 3D mapping of the face mesh */
    faceUVMap: [number, number][];
    /** Performance object that contains values for all recently performed operations */
    performance: Record<string, number>;
    /** Constructor for **Human** library that is futher used for all operations
     * @param userConfig - user configuration object {@link Config}
     */
    constructor(userConfig?: Partial<Config>);
    /** internal function to measure tensor leaks */
    analyze: (...msg: string[]) => void;
    /** Reset configuration to default values */
    reset(): void;
    /** Validate current configuration schema */
    validate(userConfig?: Partial<Config>): {
        reason: string;
        where: string;
        expected?: string;
    }[];
    /** Utility wrapper for performance.now() */
    now(): number;
    /** Process input as return canvas and tensor
     *
     * @param input - any input {@link Input}
     * @param getTensor - should image processing also return tensor or just canvas
     * Returns object with `tensor` and `canvas`
     */
    image(input: Input, getTensor?: boolean): Promise<{
        tensor: Tensor4D | null;
        canvas: AnyCanvas | null;
    }>;
    /** Segmentation method takes any input and returns RGBA tensor
     * Note: Segmentation is not triggered as part of detect process
     *
     * @param input - {@link Input}
     * Returns tensor which contains image data in RGBA format
     */
    segmentation(input: Input, userConfig?: Partial<Config>): Promise<Tensor | null>;
    /** Compare two input tensors for pixel similarity
     * - use `human.image` to process any valid input and get a tensor that can be used for compare
     * - when passing manually generated tensors:
     *  - both input tensors must be in format [1, height, width, 3]
     *  - if resolution of tensors does not match, second tensor will be resized to match resolution of the first tensor
     * - return value is pixel similarity score normalized by input resolution and rgb channels
     */
    compare(firstImageTensor: Tensor, secondImageTensor: Tensor): Promise<number>;
    /** Explicit backend initialization
     *  - Normally done implicitly during initial load phase
     *  - Call to explictly register and initialize TFJS backend without any other operations
     *  - Use when changing backend during runtime
     */
    init(): Promise<void>;
    /** WebCam helper methods
     *
     */
    webcam: WebCam;
    /** Load method preloads all configured models on-demand
     * - Not explicitly required as any required model is load implicitly on it's first run
     *
     * @param userConfig - {@link Config}
     */
    load(userConfig?: Partial<Config>): Promise<void>;
    /** emit event */
    emit: (event: string) => void;
    /** Runs interpolation using last known result and returns smoothened result
     * Interpolation is based on time since last known result so can be called independently
     *
     * @param result - {@link Result} optional use specific result set to run interpolation on
     * @returns result - {@link Result}
     */
    next(result?: Result): Result;
    /** Warmup method pre-initializes all configured models for faster inference
     * - can take significant time on startup
     * - only used for `webgl` and `humangl` backends
     * @param userConfig - {@link Config}
     * @returns result - {@link Result}
     */
    warmup(userConfig?: Partial<Config>): Promise<Result | undefined>;
    /** Run detect with tensorflow profiling
     * - result object will contain total exeuction time information for top-20 kernels
     * - actual detection object can be accessed via `human.result`
     */
    profile(input: Input, userConfig?: Partial<Config>): Promise<{
        kernel: string;
        time: number;
        perc: number;
    }[]>;
    /** Main detection method
     * - Analyze configuration: {@link Config}
     * - Pre-process input: {@link Input}
     * - Run inference for all configured models
     * - Process and return result: {@link Result}
     *
     * @param input - {@link Input}
     * @param userConfig - {@link Config}
     * @returns result - {@link Result}
     */
    detect(input: Input, userConfig?: Partial<Config>): Promise<Result>;
    /** Helper function
     * @param ms - sleep time in miliseconds
     */
    sleep(ms: number): Promise<void>;
    /** Continously detect video frames
     * @param element - HTMLVideoElement input
     * @param run - boolean run continously or stop if already running, default true
     * @param delay - number delay detection between frames for number of miliseconds, default 0
     */
    video(element: HTMLVideoElement, run?: boolean, delay?: number): Promise<void>;
}
export { Human }
export default Human;

/** Defines all possible image objects */
export declare type ImageObjects = ImageData | ImageBitmap;

/** sets default label templates for face/body/hand/object/gestures */
declare function init(): void;

/** Defines all possible input types for **Human** detection */
export declare type Input = Tensor | AnyCanvas | AnyImage | AnyVideo | ImageObjects | ExternalCanvas;

/** iris gesture type */
export declare type IrisGesture = 'facing center' | `looking ${'left' | 'right' | 'up' | 'down'}` | 'looking center';

declare interface KernelOps {
    name: string;
    url: string;
    missing: string[];
    ops: string[];
}

declare namespace match {
    export {
        distance,
        similarity,
        find,
        Descriptor,
        MatchOptions
    }
}
export { match }

declare type MatchOptions = {
    order?: number;
    threshold?: number;
    multiplier?: number;
    min?: number;
    max?: number;
} | undefined;

export declare interface ModelInfo {
    name: string;
    loaded: boolean;
    inCache: boolean;
    sizeDesired: number;
    sizeFromManifest: number;
    sizeLoadedWeights: number;
    url: string;
}

/** Models class used by Human
 * - models: record of all GraphModels
 * - list: returns list of configured models with their stats
 * - loaded: returns array of loaded models
 * - reset: unloads all models
 * - validate: checks loaded models for valid kernel ops vs current backend
 * - stats: live detailed model stats that can be checked during model load phase
 */
declare class Models {
    private instance;
    models: Record<string, null | GraphModel>;
    constructor(currentInstance: Human);
    stats(): ModelStats;
    reset(): void;
    load(instance?: Human): Promise<void>;
    list(): {
        name: string;
        loaded: boolean;
        size: number;
        url: any;
    }[];
    loaded(): string[];
    validate(): {
        name: string;
        missing: string[];
    }[];
}

declare namespace models {
    export {
        validateModel,
        KernelOps,
        ModelStats,
        Models
    }
}
export { models }

/** structure that holds global stats for currently loaded models */
declare interface ModelStats {
    numLoadedModels: number;
    numDefinedModels: number;
    percentageLoaded: number;
    totalSizeFromManifest: number;
    totalSizeWeights: number;
    totalSizeLoading: number;
    modelStats: ModelInfo[];
}

/** draw detected objects */
declare function object(inCanvas: AnyCanvas, result: ObjectResult[], drawOptions?: Partial<DrawOptions>): void;

/** Configures all object detection specific options */
export declare interface ObjectConfig extends GenericConfig {
    /** minimum confidence for a detected objects before results are discarded */
    minConfidence: number;
    /** minimum overlap between two detected objects before one is discarded */
    iouThreshold: number;
    /** maximum number of detected objects */
    maxDetected: number;
}

/** Object results */
export declare interface ObjectResult {
    /** object id */
    id: number;
    /** object detection score */
    score: number;
    /** detected object class id */
    class: number;
    /** detected object class name */
    label: ObjectType;
    /** detected object box */
    box: Box;
    /** detected object box normalized to 0..1 */
    boxRaw: Box;
}

export declare type ObjectType = 'person' | 'bicycle' | 'car' | 'motorcycle' | 'airplane' | 'bus' | 'train' | 'truck' | 'boat' | 'traffic light' | 'fire hydrant' | 'stop sign' | 'parking meter' | 'bench' | 'bird' | 'cat' | 'dog' | 'horse' | 'sheep' | 'cow' | 'elephant' | 'bear' | 'zebra' | 'giraffe' | 'backpack' | 'umbrella' | 'handbag' | 'tie' | 'suitcase' | 'frisbee' | 'skis' | 'snowboard' | 'sports ball' | 'kite' | 'baseball bat' | 'baseball glove' | 'skateboard' | 'surfboard' | 'tennis racket' | 'bottle' | 'wine glass' | 'cup' | 'fork' | 'knife' | 'spoon' | 'bowl' | 'banana' | 'apple' | 'sandwich' | 'orange' | 'broccoli' | 'carrot' | 'hot dog' | 'pizza' | 'donut' | 'cake' | 'chair' | 'couch' | 'potted plant' | 'bed' | 'dining table' | 'toilet' | 'tv' | 'laptop' | 'mouse' | 'remote' | 'keyboard' | 'cell phone' | 'microwave' | 'oven' | 'toaster' | 'sink' | 'refrigerator' | 'book' | 'clock' | 'vase' | 'scissors' | 'teddy bear' | 'hair drier' | 'toothbrush';

/** currently set draw options {@link DrawOptions} */
declare const options: DrawOptions;

/** draw combined person results instead of individual detection result objects */
declare function person(inCanvas: AnyCanvas, result: PersonResult[], drawOptions?: Partial<DrawOptions>): void;

/** Person getter
 * - Triggers combining all individual results into a virtual person object
 */
export declare interface PersonResult {
    /** person id */
    id: number;
    /** face result that belongs to this person */
    face: FaceResult;
    /** body result that belongs to this person */
    body: BodyResult | null;
    /** left and right hand results that belong to this person */
    hands: {
        left: HandResult | null;
        right: HandResult | null;
    };
    /** detected gestures specific to this person */
    gestures: GestureResult[];
    /** box that defines the person */
    box: Box;
    /** box that defines the person normalized to 0..1 */
    boxRaw?: Box;
}

/** generic point as [x, y, z?] */
export declare type Point = [number, number, number?];

export declare type Race = 'white' | 'black' | 'asian' | 'indian' | 'other';

export { Rank }

/**
 * Result interface definition for **Human** library
 *
 * Contains all possible detection results
 */
export declare interface Result {
    /** {@link FaceResult}: detection & analysis results */
    face: FaceResult[];
    /** {@link BodyResult}: detection & analysis results */
    body: BodyResult[];
    /** {@link HandResult}: detection & analysis results */
    hand: HandResult[];
    /** {@link GestureResult}: detection & analysis results */
    gesture: GestureResult[];
    /** {@link ObjectResult}: detection & analysis results */
    object: ObjectResult[];
    /** global performance object with timing values for each operation */
    performance: Record<string, number>;
    /** optional processed canvas that can be used to draw input on screen */
    canvas?: AnyCanvas | null;
    /** timestamp of detection representing the milliseconds elapsed since the UNIX epoch */
    readonly timestamp: number;
    /** getter property that returns unified persons object  */
    persons: PersonResult[];
    /** Last known error message */
    error: string | null;
    /** Resolution width */
    width: number;
    /** Resolution height */
    height: number;
}

/** Configures all body segmentation module
 * removes background from input containing person
 * if segmentation is enabled it will run as preprocessing task before any other model
 * alternatively leave it disabled and use it on-demand using human.segmentation method which can
 * remove background or replace it with user-provided background
 */
export declare interface SegmentationConfig extends GenericConfig {
    /** downsample ratio, adjust to reflect approximately how much of input is taken by body */
    ratio: number;
    /** possible rvm segmentation mode */
    mode: SegmentationEnum;
}

/** Possible segmentation model behavior */
export declare type SegmentationEnum = 'default' | 'alpha' | 'foreground' | 'state';

/** Calculates normalized similarity between two face descriptors based on their `distance`
 * @param options - calculation options
 * - order - algorithm to use
 *   Euclidean distance if `order` is 2 (default), Minkowski distance algorithm of nth order if `order` is higher than 2
 * - multiplier - by how much to enhance difference analysis in range of 1..100
 *   default is 20 which normalizes results to similarity above 0.5 can be considered a match
 * - min - normalize similarity result to a given range
 * - max - normalzie similarity resutl to a given range
 *   default is 0.2...0.8
 * Returns similarity between two face descriptors normalized to 0..1 range where 0 is no similarity and 1 is perfect similarity
 */
declare function similarity(descriptor1: Descriptor, descriptor2: Descriptor, options?: MatchOptions): number;

export { Tensor }

/** draw processed canvas */
declare function tensor(input: Tensor2D, output: HTMLCanvasElement): Promise<void>;

export { Tensor1D }

export { Tensor2D }

export { Tensor3D }

export { Tensor4D }

export { TensorLike }

declare function validateModel(instance: Human | null, model: GraphModel | null, name: string): KernelOps | null;

/** Possible values for `human.warmup` */
export declare type WarmupEnum = '' | 'none' | 'face' | 'full' | 'body';

export declare class WebCam {
    /** current webcam configuration */
    config: WebCamConfig;
    /** instance of dom element associated with webcam stream */
    element: HTMLVideoElement | undefined;
    /** active webcam stream */
    stream: MediaStream | undefined;
    /** enumerated video devices */
    devices: MediaDeviceInfo[];
    constructor();
    /** get active webcam stream track */
    get track(): MediaStreamTrack | undefined;
    /** get webcam capabilities */
    get capabilities(): MediaTrackCapabilities | undefined;
    /** get webcam constraints */
    get constraints(): MediaTrackConstraints | undefined;
    /** get webcam settings */
    get settings(): MediaTrackSettings | undefined;
    /** get webcam label */
    get label(): string;
    /** is webcam paused */
    get paused(): boolean;
    /** webcam current width */
    get width(): number;
    /** webcam current height */
    get height(): number;
    enumerate: () => Promise<MediaDeviceInfo[]>;
    /** start method initializizes webcam stream and associates it with a dom video element */
    start: (webcamConfig?: Partial<WebCamConfig>) => Promise<string>;
    /** pause webcam video method */
    pause: () => void;
    /** play webcam video method */
    play: () => Promise<void>;
    /** stop method stops active webcam stream track and disconnects webcam */
    stop: () => void;
}

/** WebCam configuration */
export declare interface WebCamConfig {
    /**
     * element can be:
     * - string which indicates dom element id
     * - actual HTMLVideo dom element
     * - undefined in which case a new HTMLVideoElement will be created
     */
    element: string | HTMLVideoElement | undefined;
    /** print messages on console */
    debug: boolean;
    /** use front or back camera */
    mode: 'front' | 'back';
    /** camera crop mode */
    crop: boolean;
    /** desired webcam width */
    width: number;
    /** desired webcam height */
    height: number;
    /** deviceId of the video device to use */
    id?: string;
}

export { }
