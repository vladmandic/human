/** meta-function that performs draw for: canvas, face, body, hand */
declare function all(inCanvas: AnyCanvas, result: Result, drawOptions?: Partial<DrawOptions>): Promise<[void, void, void, void, void] | null>;

/** Defines all possible canvas types */
export declare type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

/** Defines all possible image types */
export declare type AnyImage = HTMLImageElement | typeof Image;

/** Defines all possible video types */
export declare type AnyVideo = HTMLMediaElement | HTMLVideoElement;

/** @docalias number[] */
declare interface ArrayMap {
    R0: number;
    R1: number[];
    R2: number[][];
    R3: number[][][];
    R4: number[][][][];
    R5: number[][][][][];
    R6: number[][][][][][];
}

/** Possible TensorFlow backends */
export declare type BackendType = ['cpu', 'wasm', 'webgl', 'humangl', 'tensorflow', 'webgpu'];

/** draw detected bodies */
declare function body(inCanvas: AnyCanvas, result: Array<BodyResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;

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
    keypoints: Array<BodyKeypoint>;
    /** detected body keypoints combined into annotated parts */
    annotations: Record<BodyAnnotation, Point[][]>;
}

/** generic box as [x, y, width, height] */
export declare type Box = [number, number, number, number];

/**
 * Creates an IOHandler that loads model artifacts from user-selected files.
 *
 * This method can be used for loading from files such as user-selected files
 * in the browser.
 * When used in conjunction with `tf.loadLayersModel`, an instance of
 * `tf.LayersModel` (Keras-style) can be constructed from the loaded artifacts.
 *
 * ```js
 * // Note: This code snippet won't run properly without the actual file input
 * //   elements in the HTML DOM.
 *
 * // Suppose there are two HTML file input (`<input type="file" ...>`)
 * // elements.
 * const uploadJSONInput = document.getElementById('upload-json');
 * const uploadWeightsInput = document.getElementById('upload-weights');
 * const model = await tf.loadLayersModel(tf.io.browserFiles(
 *     [uploadJSONInput.files[0], uploadWeightsInput.files[0]]));
 * ```
 *
 * @param files `File`s to load from. Currently, this function supports only
 *   loading from files that contain Keras-style models (i.e., `tf.Model`s), for
 *   which an `Array` of `File`s is expected (in that order):
 *   - A JSON file containing the model topology and weight manifest.
 *   - Optionally, One or more binary files containing the binary weights.
 *     These files must have names that match the paths in the `weightsManifest`
 *     contained by the aforementioned JSON file, or errors will be thrown
 *     during loading. These weights files have the same format as the ones
 *     generated by `tensorflowjs_converter` that comes with the `tensorflowjs`
 *     Python PIP package. If no weights files are provided, only the model
 *     topology will be loaded from the JSON file above.
 * @returns An instance of `Files` `IOHandler`.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Loading',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function browserFiles(files: File[]): IOHandler;

/**
 * Deprecated. Use `tf.io.http`.
 * @param path
 * @param loadOptions
 */
declare function browserHTTPRequest(path: string, loadOptions?: LoadOptions): IOHandler;

/** draw processed canvas */
declare function canvas(input: AnyCanvas | HTMLImageElement | HTMLVideoElement, output: AnyCanvas): Promise<void>;

/**
 * Concatenate a number of ArrayBuffers into one.
 *
 * @param buffers A number of array buffers to concatenate.
 * @returns Result of concatenating `buffers` in order.
 */
declare function concatenateArrayBuffers(buffers: ArrayBuffer[]): ArrayBuffer;

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
     * default: `humangl` for browser and `tensorflow` for nodejs
     */
    backend: '' | 'cpu' | 'wasm' | 'webgl' | 'humangl' | 'tensorflow' | 'webgpu';
    /** Path to *.wasm files if backend is set to `wasm`
     *
     * default: auto-detects to link to CDN `jsdelivr` when running in browser
     */
    wasmPath: string;
    /** Force WASM loader to use platform fetch
     *
     * default: auto-detects to link to CDN `jsdelivr` when running in browser
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
    warmup: '' | 'none' | 'face' | 'full' | 'body';
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
    /** Cache sensitivity
     * - values 0..1 where 0.01 means reset cache if input changed more than 1%
     * - set to 0 to disable caching
     *
     * default: 0.7
     */
    cacheSensitivity: number;
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

/**
 * Copy a model from one URL to another.
 *
 * This function supports:
 *
 * 1. Copying within a storage medium, e.g.,
 *    `tf.io.copyModel('localstorage://model-1', 'localstorage://model-2')`
 * 2. Copying between two storage mediums, e.g.,
 *    `tf.io.copyModel('localstorage://model-1', 'indexeddb://model-1')`
 *
 * ```js
 * // First create and save a model.
 * const model = tf.sequential();
 * model.add(tf.layers.dense(
 *     {units: 1, inputShape: [10], activation: 'sigmoid'}));
 * await model.save('localstorage://demo/management/model1');
 *
 * // Then list existing models.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Copy the model, from Local Storage to IndexedDB.
 * await tf.io.copyModel(
 *     'localstorage://demo/management/model1',
 *     'indexeddb://demo/management/model1');
 *
 * // List models again.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Remove both models.
 * await tf.io.removeModel('localstorage://demo/management/model1');
 * await tf.io.removeModel('indexeddb://demo/management/model1');
 * ```
 *
 * @param sourceURL Source URL of copying.
 * @param destURL Destination URL of copying.
 * @returns ModelArtifactsInfo of the copied model (if and only if copying
 *   is successful).
 * @throws Error if copying fails, e.g., if no model exists at `sourceURL`, or
 *   if `oldPath` and `newPath` are identical.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Management',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function copyModel(sourceURL: string, destURL: string): Promise<ModelArtifactsInfo>;

/**
 * We wrap data id since we use weak map to avoid memory leaks.
 * Since we have our own memory management, we have a reference counter
 * mapping a tensor to its data, so there is always a pointer (even if that
 * data is otherwise garbage collectable).
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 * Global_Objects/WeakMap
 */
declare type DataId = object;

declare type DataToGPUOptions = DataToGPUWebGLOption;

declare interface DataToGPUWebGLOption {
    customTexShape?: [number, number];
}

/** @docalias 'float32'|'int32'|'bool'|'complex64'|'string' */
declare type DataType = keyof DataTypeMap;

declare interface DataTypeMap {
    float32: Float32Array;
    int32: Int32Array;
    bool: Uint8Array;
    complex64: Float32Array;
    string: string[];
}

/**
 * Decode flat ArrayBuffer as weights.
 *
 * This function does not handle sharding.
 *
 * This function is the reverse of `encodeWeights`.
 *
 * @param buffer A flat ArrayBuffer carrying the binary values of the tensors
 *   concatenated in the order specified in `specs`.
 * @param specs Specifications of the names, dtypes and shapes of the tensors
 *   whose value are encoded by `buffer`.
 * @return A map from tensor name to tensor value, with the names corresponding
 *   to names in `specs`.
 * @throws Error, if any of the tensors has unsupported dtype.
 */
declare function decodeWeights(buffer: ArrayBuffer, specs: WeightsManifestEntry[]): NamedTensorMap;

/** - [See all default Config values...](https://github.com/vladmandic/human/blob/main/src/config.ts#L262) */
export declare const defaults: Config;

/** Face descriptor type as number array */
export declare type Descriptor = Array<number>;

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
        gesture,
        face,
        body,
        hand,
        object,
        person,
        canvas,
        all,
        DrawOptions,
        options
    }
}
export { draw }

/** Draw Options
 * - Accessed via `human.draw.options` or provided per each draw method as the drawOptions optional parameter
 */
export declare type DrawOptions = {
    /** draw line color */
    color: string;
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
};

export declare type Emotion = 'angry' | 'disgust' | 'fear' | 'happy' | 'sad' | 'surprise' | 'neutral';

/**
 * Encode a map from names to weight values as an ArrayBuffer, along with an
 * `Array` of `WeightsManifestEntry` as specification of the encoded weights.
 *
 * This function does not perform sharding.
 *
 * This function is the reverse of `decodeWeights`.
 *
 * @param tensors A map ("dict") from names to tensors.
 * @param group Group to which the weights belong (optional).
 * @returns A `Promise` of
 *   - A flat `ArrayBuffer` with all the binary values of the `Tensor`s
 *     concatenated.
 *   - An `Array` of `WeightManifestEntry`s, carrying information including
 *     tensor names, `dtype`s and shapes.
 * @throws Error: on unsupported tensor `dtype`.
 */
declare function encodeWeights(tensors: NamedTensorMap | NamedTensor[], group?: WeightGroup): Promise<{
    data: ArrayBuffer;
    specs: WeightsManifestEntry[];
}>;

/** Env class that holds detected capabilities */
export declare class Env {
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
    };
    /** WebGPU detected capabilities */
    webgpu: {
        supported: undefined | boolean;
        backend: undefined | boolean;
        adapter: undefined | string;
    };
    /** CPU info */
    cpu: {
        model: undefined | string;
        flags: string[];
    };
    /** List of supported kernels for current backend */
    kernels: string[];
    /** MonkeyPatch for Canvas */
    Canvas: undefined;
    /** MonkeyPatch for Image */
    Image: undefined;
    /** MonkeyPatch for ImageData */
    ImageData: undefined;
    constructor();
    /** update backend information */
    updateBackend(): Promise<void>;
    /** update cpu information */
    updateCPU(): Promise<void>;
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
declare function face(inCanvas: AnyCanvas, result: Array<FaceResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;

/** Anti-spoofing part of face configuration */
export declare interface FaceAntiSpoofConfig extends GenericConfig {
}

/** Configures all face-specific options: face detection, mesh analysis, age, gender, emotion detection and face description */
export declare interface FaceConfig extends GenericConfig {
    detector: Partial<FaceDetectorConfig>;
    mesh: Partial<FaceMeshConfig>;
    iris: Partial<FaceIrisConfig>;
    description: Partial<FaceDescriptionConfig>;
    emotion: Partial<FaceEmotionConfig>;
    antispoof: Partial<FaceAntiSpoofConfig>;
    liveness: Partial<FaceLivenessConfig>;
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
    /** minimum overlap between two detected faces before one is discarded */
    iouThreshold: number;
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

/** face gesture type */
export declare type FaceGesture = `facing ${'left' | 'center' | 'right'}` | `blink ${'left' | 'right'} eye` | `mouth ${number}% open` | `head ${'up' | 'down'}`;

/** Iris part of face configuration */
export declare interface FaceIrisConfig extends GenericConfig {
}

export declare type FaceLandmark = 'leftEye' | 'rightEye' | 'nose' | 'mouth' | 'leftEar' | 'rightEar' | 'symmetryLine' | 'silhouette' | 'lipsUpperOuter' | 'lipsLowerOuter' | 'lipsUpperInner' | 'lipsLowerInner' | 'rightEyeUpper0' | 'rightEyeLower0' | 'rightEyeUpper1' | 'rightEyeLower1' | 'rightEyeUpper2' | 'rightEyeLower2' | 'rightEyeLower3' | 'rightEyebrowUpper' | 'rightEyebrowLower' | 'rightEyeIris' | 'leftEyeUpper0' | 'leftEyeLower0' | 'leftEyeUpper1' | 'leftEyeLower1' | 'leftEyeUpper2' | 'leftEyeLower2' | 'leftEyeLower3' | 'leftEyebrowUpper' | 'leftEyebrowLower' | 'leftEyeIris' | 'midwayBetweenEyes' | 'noseTip' | 'noseBottom' | 'noseRightCorner' | 'noseLeftCorner' | 'rightCheek' | 'leftCheek';

/** Liveness part of face configuration */
export declare interface FaceLivenessConfig extends GenericConfig {
}

/** Mesh part of face configuration */
export declare interface FaceMeshConfig extends GenericConfig {
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
    /** detected face mesh */
    mesh: Array<Point>;
    /** detected face mesh normalized to 0..1 */
    meshRaw: Array<Point>;
    /** mesh keypoints combined into annotated results */
    annotations: Record<FaceLandmark, Point[]>;
    /** detected age */
    age?: number;
    /** detected gender */
    gender?: Gender;
    /** gender detection score */
    genderScore?: number;
    /** detected emotions */
    emotion?: Array<{
        score: number;
        emotion: Emotion;
    }>;
    /** detected race */
    race?: Array<{
        score: number;
        race: Race;
    }>;
    /** face descriptor */
    embedding?: Array<number>;
    /** face iris distance from camera */
    iris?: number;
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

export declare type Finger = 'index' | 'middle' | 'pinky' | 'ring' | 'thumb' | 'palm';

export declare type FingerCurl = 'none' | 'half' | 'full';

export declare type FingerDirection = 'verticalUp' | 'verticalDown' | 'horizontalLeft' | 'horizontalRight' | 'diagonalUpRight' | 'diagonalUpLeft' | 'diagonalDownRight' | 'diagonalDownLeft';

/**
 * Creates an IOHandler that loads model artifacts from memory.
 *
 * When used in conjunction with `tf.loadLayersModel`, an instance of
 * `tf.LayersModel` (Keras-style) can be constructed from the loaded artifacts.
 *
 * ```js
 * const model = await tf.loadLayersModel(tf.io.fromMemory(
 *     modelTopology, weightSpecs, weightData));
 * ```
 *
 * @param modelArtifacts a object containing model topology (i.e., parsed from
 *   the JSON format).
 * @param weightSpecs An array of `WeightsManifestEntry` objects describing the
 *   names, shapes, types, and quantization of the weight data.
 * @param weightData A single `ArrayBuffer` containing the weight data,
 *   concatenated in the order described by the weightSpecs.
 * @param trainingConfig Model training configuration. Optional.
 *
 * @returns A passthrough `IOHandler` that simply loads the provided data.
 */
declare function fromMemory(modelArtifacts: {} | ModelArtifacts, weightSpecs?: WeightsManifestEntry[], weightData?: ArrayBuffer, trainingConfig?: TrainingConfig): IOHandler;

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
declare function gesture(inCanvas: AnyCanvas, result: Array<GestureResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;

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

declare const getLoadHandlers: (url: string | string[], loadOptions?: LoadOptions) => IOHandler[];

/**
 * Create `ModelArtifacts` from a JSON file.
 *
 * @param modelJSON Object containing the parsed JSON of `model.json`
 * @param loadWeights Function that takes the JSON file's weights manifest,
 *     reads weights from the listed path(s), and returns a Promise of the
 *     weight manifest entries along with the weights data.
 * @returns A Promise of the `ModelArtifacts`, as described by the JSON file.
 */
declare function getModelArtifactsForJSON(modelJSON: ModelJSON, loadWeights: (weightsManifest: WeightsManifestConfig) => Promise<[WeightsManifestEntry[], /* weightData */ ArrayBuffer]>): Promise<ModelArtifacts>;

/**
 * Populate ModelArtifactsInfo fields for a model with JSON topology.
 * @param modelArtifacts
 * @returns A ModelArtifactsInfo object.
 */
declare function getModelArtifactsInfoForJSON(modelArtifacts: ModelArtifacts): ModelArtifactsInfo;

declare const getSaveHandlers: (url: string | string[]) => IOHandler[];

declare interface GPUData {
    tensorRef: Tensor;
    texture?: WebGLTexture;
    texShape?: [number, number];
}

/**
 * A `tf.GraphModel` is a directed, acyclic graph built from a
 * SavedModel GraphDef and allows inference execution.
 *
 * A `tf.GraphModel` can only be created by loading from a model converted from
 * a [TensorFlow SavedModel](https://www.tensorflow.org/guide/saved_model) using
 * the command line converter tool and loaded via `tf.loadGraphModel`.
 *
 * @doc {heading: 'Models', subheading: 'Classes'}
 */
export declare class GraphModel implements InferenceModel {
    private modelUrl;
    private loadOptions;
    private executor;
    private version;
    private handler;
    private artifacts;
    private initializer;
    private resourceManager;
    private signature;
    readonly modelVersion: string;
    readonly inputNodes: string[];
    readonly outputNodes: string[];
    readonly inputs: TensorInfo[];
    readonly outputs: TensorInfo[];
    readonly weights: NamedTensorsMap;
    readonly metadata: {};
    readonly modelSignature: {};
    /**
     * @param modelUrl url for the model, or an `io.IOHandler`.
     * @param weightManifestUrl url for the weight file generated by
     * scripts/convert.py script.
     * @param requestOption options for Request, which allows to send credentials
     * and custom headers.
     * @param onProgress Optional, progress callback function, fired periodically
     * before the load is completed.
     */
    constructor(modelUrl: string | io.IOHandler, loadOptions?: io.LoadOptions);
    private findIOHandler;
    /**
     * Loads the model and weight files, construct the in memory weight map and
     * compile the inference graph.
     */
    load(): Promise<boolean>;
    /**
     * Synchronously construct the in memory weight map and
     * compile the inference graph. Also initialize hashtable if any.
     *
     * @doc {heading: 'Models', subheading: 'Classes', ignoreCI: true}
     */
    loadSync(artifacts: io.ModelArtifacts): boolean;
    /**
     * Save the configuration and/or weights of the GraphModel.
     *
     * An `IOHandler` is an object that has a `save` method of the proper
     * signature defined. The `save` method manages the storing or
     * transmission of serialized data ("artifacts") that represent the
     * model's topology and weights onto or via a specific medium, such as
     * file downloads, local storage, IndexedDB in the web browser and HTTP
     * requests to a server. TensorFlow.js provides `IOHandler`
     * implementations for a number of frequently used saving mediums, such as
     * `tf.io.browserDownloads` and `tf.io.browserLocalStorage`. See `tf.io`
     * for more details.
     *
     * This method also allows you to refer to certain types of `IOHandler`s
     * as URL-like string shortcuts, such as 'localstorage://' and
     * 'indexeddb://'.
     *
     * Example 1: Save `model`'s topology and weights to browser [local
     * storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage);
     * then load it back.
     *
     * ```js
     * const modelUrl =
     *    'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json';
     * const model = await tf.loadGraphModel(modelUrl);
     * const zeros = tf.zeros([1, 224, 224, 3]);
     * model.predict(zeros).print();
     *
     * const saveResults = await model.save('localstorage://my-model-1');
     *
     * const loadedModel = await tf.loadGraphModel('localstorage://my-model-1');
     * console.log('Prediction from loaded model:');
     * model.predict(zeros).print();
     * ```
     *
     * @param handlerOrURL An instance of `IOHandler` or a URL-like,
     * scheme-based string shortcut for `IOHandler`.
     * @param config Options for saving the model.
     * @returns A `Promise` of `SaveResult`, which summarizes the result of
     * the saving, such as byte sizes of the saved artifacts for the model's
     *   topology and weight values.
     *
     * @doc {heading: 'Models', subheading: 'Classes', ignoreCI: true}
     */
    save(handlerOrURL: io.IOHandler | string, config?: io.SaveConfig): Promise<io.SaveResult>;
    /**
     * Execute the inference for the input tensors.
     *
     * @param input The input tensors, when there is single input for the model,
     * inputs param should be a `tf.Tensor`. For models with mutliple inputs,
     * inputs params should be in either `tf.Tensor`[] if the input order is
     * fixed, or otherwise NamedTensorMap format.
     *
     * For model with multiple inputs, we recommend you use NamedTensorMap as the
     * input type, if you use `tf.Tensor`[], the order of the array needs to
     * follow the
     * order of inputNodes array. @see {@link GraphModel.inputNodes}
     *
     * You can also feed any intermediate nodes using the NamedTensorMap as the
     * input type. For example, given the graph
     *    InputNode => Intermediate => OutputNode,
     * you can execute the subgraph Intermediate => OutputNode by calling
     *    model.execute('IntermediateNode' : tf.tensor(...));
     *
     * This is useful for models that uses tf.dynamic_rnn, where the intermediate
     * state needs to be fed manually.
     *
     * For batch inference execution, the tensors for each input need to be
     * concatenated together. For example with mobilenet, the required input shape
     * is [1, 244, 244, 3], which represents the [batch, height, width, channel].
     * If we are provide a batched data of 100 images, the input tensor should be
     * in the shape of [100, 244, 244, 3].
     *
     * @param config Prediction configuration for specifying the batch size and
     * output node names. Currently the batch size option is ignored for graph
     * model.
     *
     * @returns Inference result tensors. The output would be single `tf.Tensor`
     * if model has single output node, otherwise Tensor[] or NamedTensorMap[]
     * will be returned for model with multiple outputs.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    predict(inputs: Tensor | Tensor[] | NamedTensorMap, config?: ModelPredictConfig): Tensor | Tensor[] | NamedTensorMap;
    private normalizeInputs;
    private normalizeOutputs;
    /**
     * Executes inference for the model for given input tensors.
     * @param inputs tensor, tensor array or tensor map of the inputs for the
     * model, keyed by the input node names.
     * @param outputs output node name from the Tensorflow model, if no
     * outputs are specified, the default outputs of the model would be used.
     * You can inspect intermediate nodes of the model by adding them to the
     * outputs array.
     *
     * @returns A single tensor if provided with a single output or no outputs
     * are provided and there is only one default output, otherwise return a
     * tensor array. The order of the tensor array is the same as the outputs
     * if provided, otherwise the order of outputNodes attribute of the model.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    execute(inputs: Tensor | Tensor[] | NamedTensorMap, outputs?: string | string[]): Tensor | Tensor[];
    /**
     * Executes inference for the model for given input tensors in async
     * fashion, use this method when your model contains control flow ops.
     * @param inputs tensor, tensor array or tensor map of the inputs for the
     * model, keyed by the input node names.
     * @param outputs output node name from the Tensorflow model, if no outputs
     * are specified, the default outputs of the model would be used. You can
     * inspect intermediate nodes of the model by adding them to the outputs
     * array.
     *
     * @returns A Promise of single tensor if provided with a single output or
     * no outputs are provided and there is only one default output, otherwise
     * return a tensor map.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    executeAsync(inputs: Tensor | Tensor[] | NamedTensorMap, outputs?: string | string[]): Promise<Tensor | Tensor[]>;
    /**
     * Get intermediate tensors for model debugging mode (flag
     * KEEP_INTERMEDIATE_TENSORS is true).
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    getIntermediateTensors(): NamedTensorsMap;
    /**
     * Dispose intermediate tensors for model debugging mode (flag
     * KEEP_INTERMEDIATE_TENSORS is true).
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    disposeIntermediateTensors(): void;
    private convertTensorMapToTensorsMap;
    /**
     * Releases the memory used by the weight tensors and resourceManager.
     *
     * @doc {heading: 'Models', subheading: 'Classes'}
     */
    dispose(): void;
}

/** draw detected hands */
declare function hand(inCanvas: AnyCanvas, result: Array<HandResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;

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
    keypoints: Array<Point>;
    /** detected hand class */
    label: HandType;
    /** detected hand keypoints combined into annotated parts */
    annotations: Record<Finger, Array<Point>>;
    /** detected hand parts annotated with part gestures */
    landmarks: Record<Finger, {
        curl: FingerCurl;
        direction: FingerDirection;
    }>;
}

export declare type HandType = 'hand' | 'fist' | 'pinch' | 'point' | 'face' | 'tip' | 'pinchtip';

/**
 * Creates an IOHandler subtype that sends model artifacts to HTTP server.
 *
 * An HTTP request of the `multipart/form-data` mime type will be sent to the
 * `path` URL. The form data includes artifacts that represent the topology
 * and/or weights of the model. In the case of Keras-style `tf.Model`, two
 * blobs (files) exist in form-data:
 *   - A JSON file consisting of `modelTopology` and `weightsManifest`.
 *   - A binary weights file consisting of the concatenated weight values.
 * These files are in the same format as the one generated by
 * [tfjs_converter](https://js.tensorflow.org/tutorials/import-keras.html).
 *
 * The following code snippet exemplifies the client-side code that uses this
 * function:
 *
 * ```js
 * const model = tf.sequential();
 * model.add(
 *     tf.layers.dense({units: 1, inputShape: [100], activation: 'sigmoid'}));
 *
 * const saveResult = await model.save(tf.io.http(
 *     'http://model-server:5000/upload', {requestInit: {method: 'PUT'}}));
 * console.log(saveResult);
 * ```
 *
 * If the default `POST` method is to be used, without any custom parameters
 * such as headers, you can simply pass an HTTP or HTTPS URL to `model.save`:
 *
 * ```js
 * const saveResult = await model.save('http://model-server:5000/upload');
 * ```
 *
 * The following GitHub Gist
 * https://gist.github.com/dsmilkov/1b6046fd6132d7408d5257b0976f7864
 * implements a server based on [flask](https://github.com/pallets/flask) that
 * can receive the request. Upon receiving the model artifacts via the requst,
 * this particular server reconsistutes instances of [Keras
 * Models](https://keras.io/models/model/) in memory.
 *
 *
 * @param path A URL path to the model.
 *   Can be an absolute HTTP path (e.g.,
 *   'http://localhost:8000/model-upload)') or a relative path (e.g.,
 *   './model-upload').
 * @param requestInit Request configurations to be used when sending
 *    HTTP request to server using `fetch`. It can contain fields such as
 *    `method`, `credentials`, `headers`, `mode`, etc. See
 *    https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 *    for more information. `requestInit` must not have a body, because the
 * body will be set by TensorFlow.js. File blobs representing the model
 * topology (filename: 'model.json') and the weights of the model (filename:
 * 'model.weights.bin') will be appended to the body. If `requestInit` has a
 * `body`, an Error will be thrown.
 * @param loadOptions Optional configuration for the loading. It includes the
 *   following fields:
 *   - weightPathPrefix Optional, this specifies the path prefix for weight
 *     files, by default this is calculated from the path param.
 *   - fetchFunc Optional, custom `fetch` function. E.g., in Node.js,
 *     the `fetch` from node-fetch can be used here.
 *   - onProgress Optional, progress callback function, fired periodically
 *     before the load is completed.
 * @returns An instance of `IOHandler`.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Loading',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function http(path: string, loadOptions?: LoadOptions): IOHandler;

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
     * [TFJS API]: {@link https://js.tensorflow.org/api/latest/}
     */
    tf: any;
    /** Object containing environment information used for diagnostics */
    env: Env;
    /** Draw helper classes that can draw detected objects on canvas using specified draw
     * - canvas: draws input to canvas
     * - options: are global settings for all draw operations, can be overriden for each draw method {@link DrawOptions}
     * - face, body, hand, gesture, object, person: draws detected results as overlays on canvas
     */
    draw: {
        canvas: typeof draw.canvas;
        face: typeof draw.face;
        body: typeof draw.body;
        hand: typeof draw.hand;
        gesture: typeof draw.gesture;
        object: typeof draw.object;
        person: typeof draw.person;
        all: typeof draw.all;
        options: DrawOptions;
    };
    /** Currently loaded models
     * @internal
     * {@link Models}
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
    /** WebGL debug info */
    gl: Record<string, unknown>;
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
    /** Exports face matching methods {@link match#similarity} */
    similarity: typeof match.similarity;
    /** Exports face matching methods {@link match#distance} */
    distance: typeof match.distance;
    /** Exports face matching methods {@link match#match} */
    match: typeof match.match;
    /** Utility wrapper for performance.now() */
    now(): number;
    /** Process input as return canvas and tensor
     *
     * @param input - any input {@link Input}
     * @param getTensor - should image processing also return tensor or just canvas
     * Returns object with `tensor` and `canvas`
     */
    image(input: Input, getTensor?: boolean): Promise<{
        tensor: Tensor<Rank> | null;
        canvas: AnyCanvas | null;
    }>;
    /** Segmentation method takes any input and returns processed canvas with body segmentation
     *  - Segmentation is not triggered as part of detect process
     * @param input - {@link Input}
     * @param background - {@link Input}
     *  - Optional parameter background is used to fill the background with specific input
     *  Returns:
     *  - `data` as raw data array with per-pixel segmentation values
     *  - `canvas` as canvas which is input image filtered with segementation data and optionally merged with background image. canvas alpha values are set to segmentation values for easy merging
     *  - `alpha` as grayscale canvas that represents segmentation alpha values
     */
    segmentation(input: Input, background?: Input): Promise<{
        data: number[] | Tensor;
        canvas: AnyCanvas | null;
        alpha: AnyCanvas | null;
    }>;
    /** Enhance method performs additional enhacements to face image previously detected for futher processing
     *
     * @param input - Tensor as provided in human.result.face[n].tensor
     * @returns Tensor
     */
    enhance(input: Tensor): Tensor | null;
    /** Compare two input tensors for pixel simmilarity
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
    profile(input: Input, userConfig?: Partial<Config>): Promise<Record<string, number>>;
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
}
export { Human }
export default Human;

/** Defines all possible image objects */
export declare type ImageObjects = ImageData | ImageBitmap;

/**
 * Common interface for a machine learning model that can do inference.
 */
declare interface InferenceModel {
    /**
     * Return the array of input tensor info.
     */
    readonly inputs: ModelTensorInfo[];
    /**
     * Return the array of output tensor info.
     */
    readonly outputs: ModelTensorInfo[];
    /**
     * Execute the inference for the input tensors.
     *
     * @param input The input tensors, when there is single input for the model,
     * inputs param should be a Tensor. For models with multiple inputs, inputs
     * params should be in either Tensor[] if the input order is fixed, or
     * otherwise NamedTensorMap format.
     * For batch inference execution, the tensors for each input need to be
     * concatenated together. For example with mobilenet, the required input shape
     * is [1, 244, 244, 3], which represents the [batch, height, width, channel].
     * If we are provide a batched data of 100 images, the input tensor should be
     * in the shape of [100, 244, 244, 3].
     *
     * @param config Prediction configuration for specifying the batch size.
     *
     * @returns Inference result tensors. The output would be single Tensor if
     * model has single output node, otherwise Tensor[] or NamedTensorMap[] will
     * be returned for model with multiple outputs.
     */
    predict(inputs: Tensor | Tensor[] | NamedTensorMap, config: ModelPredictConfig): Tensor | Tensor[] | NamedTensorMap;
    /**
     * Single Execute the inference for the input tensors and return activation
     * values for specified output node names without batching.
     *
     * @param input The input tensors, when there is single input for the model,
     * inputs param should be a Tensor. For models with multiple inputs, inputs
     * params should be in either Tensor[] if the input order is fixed, or
     * otherwise NamedTensorMap format.
     *
     * @param outputs string|string[]. List of output node names to retrieve
     * activation from.
     *
     * @returns Activation values for the output nodes result tensors. The return
     * type matches specified parameter outputs type. The output would be single
     * Tensor if single output is specified, otherwise Tensor[] for multiple
     * outputs.
     */
    execute(inputs: Tensor | Tensor[] | NamedTensorMap, outputs: string | string[]): Tensor | Tensor[];
}

/** Defines all possible input types for **Human** detection */
export declare type Input = Tensor | AnyCanvas | AnyImage | AnyVideo | ImageObjects | ExternalCanvas;

declare namespace io {
    export {
        copyModel,
        listModels,
        moveModel,
        removeModel,
        browserFiles,
        browserHTTPRequest,
        concatenateArrayBuffers,
        decodeWeights,
        encodeWeights,
        fromMemory,
        getLoadHandlers,
        getModelArtifactsForJSON,
        getModelArtifactsInfoForJSON,
        getSaveHandlers,
        http,
        IOHandler,
        isHTTPScheme,
        LoadHandler,
        LoadOptions,
        loadWeights,
        ModelArtifacts,
        ModelArtifactsInfo,
        ModelJSON,
        ModelStoreManager,
        OnProgressCallback,
        registerLoadRouter,
        registerSaveRouter,
        RequestDetails,
        SaveConfig,
        SaveHandler,
        SaveResult,
        TrainingConfig,
        WeightGroup,
        weightsLoaderFactory,
        WeightsManifestConfig,
        WeightsManifestEntry,
        withSaveHandler
    }
}

/**
 * Interface for a model import/export handler.
 *
 * The `save` and `load` handlers are both optional, in order to allow handlers
 * that support only saving or loading.
 */
declare interface IOHandler {
    save?: SaveHandler;
    load?: LoadHandler;
}

declare type IORouter = (url: string | string[], loadOptions?: LoadOptions) => IOHandler;

/** iris gesture type */
export declare type IrisGesture = 'facing center' | `looking ${'left' | 'right' | 'up' | 'down'}` | 'looking center';

declare function isHTTPScheme(url: string): boolean;

/**
 * List all models stored in registered storage mediums.
 *
 * For a web browser environment, the registered mediums are Local Storage and
 * IndexedDB.
 *
 * ```js
 * // First create and save a model.
 * const model = tf.sequential();
 * model.add(tf.layers.dense(
 *     {units: 1, inputShape: [10], activation: 'sigmoid'}));
 * await model.save('localstorage://demo/management/model1');
 *
 * // Then list existing models.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Delete the model.
 * await tf.io.removeModel('localstorage://demo/management/model1');
 *
 * // List models again.
 * console.log(JSON.stringify(await tf.io.listModels()));
 * ```
 *
 * @returns A `Promise` of a dictionary mapping URLs of existing models to
 * their model artifacts info. URLs include medium-specific schemes, e.g.,
 *   'indexeddb://my/model/1'. Model artifacts info include type of the
 * model's topology, byte sizes of the topology, weights, etc.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Management',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function listModels(): Promise<{
    [url: string]: ModelArtifactsInfo;
}>;

/** Load method preloads all instance.configured models on-demand */
declare function load(instance: Human): Promise<void>;

/**
 * Type definition for handlers of loading operations.
 */
declare type LoadHandler = () => Promise<ModelArtifacts>;

/** @innamespace io */
declare interface LoadOptions {
    /**
     * RequestInit (options) for HTTP requests.
     *
     * For detailed information on the supported fields, see
     * [https://developer.mozilla.org/en-US/docs/Web/API/Request/Request](
     *     https://developer.mozilla.org/en-US/docs/Web/API/Request/Request)
     */
    requestInit?: RequestInit;
    /**
     * Progress callback.
     */
    onProgress?: OnProgressCallback;
    /**
     * A function used to override the `window.fetch` function.
     */
    fetchFunc?: Function;
    /**
     * Strict loading model: whether extraneous weights or missing
     * weights should trigger an `Error`.
     *
     * If `true`, require that the provided weights exactly match those
     * required by the layers. `false` means that both extra weights
     * and missing weights will be silently ignored.
     *
     * Default: `true`.
     */
    strict?: boolean;
    /**
     * Path prefix for weight files, by default this is calculated from the
     * path of the model JSON file.
     *
     * For instance, if the path to the model JSON file is
     * `http://localhost/foo/model.json`, then the default path prefix will be
     * `http://localhost/foo/`. If a weight file has the path value
     * `group1-shard1of2` in the weight manifest, then the weight file will be
     * loaded from `http://localhost/foo/group1-shard1of2` by default. However,
     * if you provide a `weightPathPrefix` value of
     * `http://localhost/foo/alt-weights`, then the weight file will be loaded
     * from the path `http://localhost/foo/alt-weights/group1-shard1of2` instead.
     */
    weightPathPrefix?: string;
    /**
     * Whether the module or model is to be loaded from TF Hub.
     *
     * Setting this to `true` allows passing a TF-Hub module URL, omitting the
     * standard model file name and the query parameters.
     *
     * Default: `false`.
     */
    fromTFHub?: boolean;
    /**
     * An async function to convert weight file name to URL. The weight file
     * names are stored in model.json's weightsManifest.paths field. By default we
     * consider weight files are colocated with the model.json file. For example:
     *     model.json URL: https://www.google.com/models/1/model.json
     *     group1-shard1of1.bin url:
     *        https://www.google.com/models/1/group1-shard1of1.bin
     *
     * With this func you can convert the weight file name to any URL.
     */
    weightUrlConverter?: (weightFileName: string) => Promise<string>;
}

/**
 * Reads a weights manifest JSON configuration, fetches the weights and
 * returns them as `Tensor`s.
 *
 * @param manifest The weights manifest JSON.
 * @param filePathPrefix The path prefix for filenames given in the manifest.
 *     Defaults to the empty string.
 * @param weightNames The names of the weights to be fetched.
 */
declare function loadWeights(manifest: WeightsManifestConfig, filePathPrefix?: string, weightNames?: string[], requestInit?: RequestInit): Promise<NamedTensorMap>;

declare namespace match {
    export {
        distance,
        similarity,
        match_2 as match,
        Descriptor,
        MatchOptions
    }
}
export { match }

/** Matches given descriptor to a closest entry in array of descriptors
 * @param descriptor - face descriptor
 * @param descriptors - array of face descriptors to commpare given descriptor to
 * @param options - see `similarity` method for options description
 * Returns
 * - `index` index array index where best match was found or -1 if no matches
 * - `distance` calculated `distance` of given descriptor to the best match
 * - `similarity` calculated normalized `similarity` of given descriptor to the best match
 */
declare function match_2(descriptor: Descriptor, descriptors: Array<Descriptor>, options?: MatchOptions): {
    index: number;
    distance: number;
    similarity: number;
};

declare type MatchOptions = {
    order?: number;
    threshold?: number;
    multiplier?: number;
    min?: number;
    max?: number;
} | undefined;

/**
 * The serialized artifacts of a model, including topology and weights.
 *
 * The `modelTopology`, `trainingConfig`, `weightSpecs` and `weightData` fields
 * of this interface are optional, in order to support topology- or weights-only
 * saving and loading.
 *
 * Note this interface is used internally in IOHandlers.  For the file format
 * written to disk as `model.json`, see `ModelJSON`.
 */
declare interface ModelArtifacts {
    /**
     * Model topology.
     *
     * For Keras-style `tf.Model`s, this is a JSON object.
     * For TensorFlow-style models (e.g., `SavedModel`), this is the JSON
     * encoding of the `GraphDef` protocol buffer.
     */
    modelTopology?: {} | ArrayBuffer;
    /**
     * Serialized configuration for the model's training.
     */
    trainingConfig?: TrainingConfig;
    /**
     * Weight specifications.
     *
     * This corresponds to the weightsData below.
     */
    weightSpecs?: WeightsManifestEntry[];
    /**
     * Binary buffer for all weight values concatenated in the order specified
     * by `weightSpecs`.
     */
    weightData?: ArrayBuffer;
    /**
     * Hard-coded format name for models saved from TensorFlow.js or converted
     * by TensorFlow.js Converter.
     */
    format?: string;
    /**
     * What library is responsible for originally generating this artifact.
     *
     * Used for debugging purposes. E.g., 'TensorFlow.js v1.0.0'.
     */
    generatedBy?: string;
    /**
     * What library or tool is responsible for converting the original model
     * to this format, applicable only if the model is output by a converter.
     *
     * Used for debugging purposes.  E.g., 'TensorFlow.js Converter v1.0.0'.
     *
     * A value of `null` means the model artifacts are generated without any
     * conversion process (e.g., saved directly from a TensorFlow.js
     * `tf.LayersModel` instance.)
     */
    convertedBy?: string | null;
    /**
     * Inputs and outputs signature for saved model.
     */
    signature?: {};
    /**
     * User-defined metadata about the model.
     */
    userDefinedMetadata?: {
        [key: string]: {};
    };
    /**
     * Initializer for the model.
     */
    modelInitializer?: {};
}

declare interface ModelArtifactsInfo {
    /**
     * Timestamp for when the model is saved.
     */
    dateSaved: Date;
    /**
     * TODO (cais,yassogba) consider removing GraphDef as GraphDefs now
     * come in a JSON format and none of our IOHandlers support a non json
     * format. We could conder replacing this with 'Binary' if we want to
     * allow future handlers to save to non json formats (though they will
     * probably want more information than 'Binary').
     * Type of the model topology
     *
     * Type of the model topology
     *
     * Possible values:
     *   - JSON: JSON config (human-readable, e.g., Keras JSON).
     *   - GraphDef: TensorFlow
     *     [GraphDef](https://www.tensorflow.org/extend/tool_developers/#graphdef)
     *     protocol buffer (binary).
     */
    modelTopologyType: 'JSON' | 'GraphDef';
    /**
     * Size of model topology (Keras JSON or GraphDef), in bytes.
     */
    modelTopologyBytes?: number;
    /**
     * Size of weight specification or manifest, in bytes.
     */
    weightSpecsBytes?: number;
    /**
     * Size of weight value data, in bytes.
     */
    weightDataBytes?: number;
}

/**
 * The on-disk format of the `model.json` file.
 *
 * TF.js 1.0 always populates the optional fields when writing model.json.
 * Prior versions did not provide those fields.
 */
declare interface ModelJSON {
    /**
     * Model topology.
     *
     * For Keras-style `tf.Model`s, this is a JSON object.
     * For TensorFlow-style models (e.g., `SavedModel`), this is the JSON
     * encoding of the `GraphDef` protocol buffer.
     */
    modelTopology: {};
    /** Model training configuration. */
    trainingConfig?: TrainingConfig;
    /**
     * Weights manifest.
     *
     * The weights manifest consists of an ordered list of weight-manifest
     * groups. Each weight-manifest group consists of a number of weight values
     * stored in a number of paths. See the documentation of
     * `WeightsManifestConfig` for more details.
     */
    weightsManifest: WeightsManifestConfig;
    /**
     * Hard-coded format name for models saved from TensorFlow.js or converted
     * by TensorFlow.js Converter.
     */
    format?: string;
    /**
     * What library is responsible for originally generating this artifact.
     *
     * Used for debugging purposes. E.g., 'TensorFlow.js v1.0.0'.
     */
    generatedBy?: string;
    /**
     * What library or tool is responsible for converting the original model
     * to this format, applicable only if the model is output by a converter.
     *
     * Used for debugging purposes.  E.g., 'TensorFlow.js Converter v1.0.0'.
     *
     * A value of `null` means the model artifacts are generated without any
     * conversion process (e.g., saved directly from a TensorFlow.js
     * `tf.LayersModel` instance.)
     */
    convertedBy?: string | null;
    /**
     * Inputs and outputs signature for saved model.
     */
    signature?: {};
    /**
     * User-defined metadata about the model.
     */
    userDefinedMetadata?: {
        [key: string]: {};
    };
    /**
     * Initializer for the model.
     */
    modelInitializer?: {};
}

declare interface ModelPredictConfig {
    /**
     * Optional. Batch size (Integer). If unspecified, it will default to 32.
     */
    batchSize?: number;
    /**
     * Optional. Verbosity mode. Defaults to false.
     */
    verbose?: boolean;
}

/** Instances of all possible TFJS Graph Models used by Human
 * - loaded as needed based on configuration
 * - initialized explictly with `human.load()` method
 * - initialized implicity on first call to `human.detect()`
 * - each model can be `null` if not loaded, instance of `GraphModel` if loaded or `Promise` if loading
 */
export declare class Models {
    ssrnetage: null | GraphModel | Promise<GraphModel>;
    gear: null | GraphModel | Promise<GraphModel>;
    blazeposedetect: null | GraphModel | Promise<GraphModel>;
    blazepose: null | GraphModel | Promise<GraphModel>;
    centernet: null | GraphModel | Promise<GraphModel>;
    efficientpose: null | GraphModel | Promise<GraphModel>;
    mobilefacenet: null | GraphModel | Promise<GraphModel>;
    emotion: null | GraphModel | Promise<GraphModel>;
    facedetect: null | GraphModel | Promise<GraphModel>;
    faceiris: null | GraphModel | Promise<GraphModel>;
    facemesh: null | GraphModel | Promise<GraphModel>;
    faceres: null | GraphModel | Promise<GraphModel>;
    ssrnetgender: null | GraphModel | Promise<GraphModel>;
    handpose: null | GraphModel | Promise<GraphModel>;
    handskeleton: null | GraphModel | Promise<GraphModel>;
    handtrack: null | GraphModel | Promise<GraphModel>;
    liveness: null | GraphModel | Promise<GraphModel>;
    movenet: null | GraphModel | Promise<GraphModel>;
    nanodet: null | GraphModel | Promise<GraphModel>;
    posenet: null | GraphModel | Promise<GraphModel>;
    segmentation: null | GraphModel | Promise<GraphModel>;
    antispoof: null | GraphModel | Promise<GraphModel>;
}

declare namespace models {
    export {
        reset,
        load,
        validate,
        Models
    }
}
export { models }

/**
 * An interface for the manager of a model store.
 *
 * A model store is defined as a storage medium on which multiple models can
 * be stored. Each stored model has a unique `path` as its identifier.
 * A `ModelStoreManager` for the store allows actions including
 *
 * - Listing the models stored in the store.
 * - Deleting a model from the store.
 */
declare interface ModelStoreManager {
    /**
     * List all models in the model store.
     *
     * @returns A dictionary mapping paths of existing models to their
     *   model artifacts info. Model artifacts info include type of the model's
     *   topology, byte sizes of the topology, weights, etc.
     */
    listModels(): Promise<{
        [path: string]: ModelArtifactsInfo;
    }>;
    /**
     * Remove a model specified by `path`.
     *
     * @param path
     * @returns ModelArtifactsInfo of the deleted model (if and only if deletion
     *   is successful).
     * @throws Error if deletion fails, e.g., if no model exists at `path`.
     */
    removeModel(path: string): Promise<ModelArtifactsInfo>;
}

/**
 * Interface for model input/output tensor info.
 */
declare interface ModelTensorInfo {
    name: string;
    shape?: number[];
    dtype: DataType;
    tfDtype?: string;
}

/**
 * Move a model from one URL to another.
 *
 * This function supports:
 *
 * 1. Moving within a storage medium, e.g.,
 *    `tf.io.moveModel('localstorage://model-1', 'localstorage://model-2')`
 * 2. Moving between two storage mediums, e.g.,
 *    `tf.io.moveModel('localstorage://model-1', 'indexeddb://model-1')`
 *
 * ```js
 * // First create and save a model.
 * const model = tf.sequential();
 * model.add(tf.layers.dense(
 *     {units: 1, inputShape: [10], activation: 'sigmoid'}));
 * await model.save('localstorage://demo/management/model1');
 *
 * // Then list existing models.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Move the model, from Local Storage to IndexedDB.
 * await tf.io.moveModel(
 *     'localstorage://demo/management/model1',
 *     'indexeddb://demo/management/model1');
 *
 * // List models again.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Remove the moved model.
 * await tf.io.removeModel('indexeddb://demo/management/model1');
 * ```
 *
 * @param sourceURL Source URL of moving.
 * @param destURL Destination URL of moving.
 * @returns ModelArtifactsInfo of the copied model (if and only if copying
 *   is successful).
 * @throws Error if moving fails, e.g., if no model exists at `sourceURL`, or
 *   if `oldPath` and `newPath` are identical.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Management',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function moveModel(sourceURL: string, destURL: string): Promise<ModelArtifactsInfo>;

declare interface NamedTensor {
    name: string;
    tensor: Tensor;
}

/** @docalias {[name: string]: Tensor} */
declare type NamedTensorMap = {
    [name: string]: Tensor;
};

declare type NamedTensorsMap = {
    [key: string]: Tensor[];
};

declare type NumericDataType = 'float32' | 'int32' | 'bool' | 'complex64';

/** draw detected objects */
declare function object(inCanvas: AnyCanvas, result: Array<ObjectResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;

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

/**
 * Callback for the progress of a long-running action such as an HTTP
 * request for a large binary object.
 *
 * `fraction` should be a number in the [0, 1] interval, indicating how
 * much of the action has completed.
 */
declare type OnProgressCallback = (fraction: number) => void;

/** currently set draw options {@link DrawOptions} */
declare const options: DrawOptions;

/** draw combined person results instead of individual detection result objects */
declare function person(inCanvas: AnyCanvas, result: Array<PersonResult>, drawOptions?: Partial<DrawOptions>): Promise<void>;

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
    gestures: Array<GestureResult>;
    /** box that defines the person */
    box: Box;
    /** box that defines the person normalized to 0..1 */
    boxRaw?: Box;
}

/** generic point as [x, y, z?] */
export declare type Point = [number, number, number?];

export declare type Race = 'white' | 'black' | 'asian' | 'indian' | 'other';

export declare enum Rank {
    R0 = "R0",
    R1 = "R1",
    R2 = "R2",
    R3 = "R3",
    R4 = "R4",
    R5 = "R5",
    R6 = "R6"
}

declare interface RecursiveArray<T extends any> {
    [index: number]: T | RecursiveArray<T>;
}

declare const registerLoadRouter: (loudRouter: IORouter) => void;

declare const registerSaveRouter: (loudRouter: IORouter) => void;

/**
 * Remove a model specified by URL from a reigstered storage medium.
 *
 * ```js
 * // First create and save a model.
 * const model = tf.sequential();
 * model.add(tf.layers.dense(
 *     {units: 1, inputShape: [10], activation: 'sigmoid'}));
 * await model.save('localstorage://demo/management/model1');
 *
 * // Then list existing models.
 * console.log(JSON.stringify(await tf.io.listModels()));
 *
 * // Delete the model.
 * await tf.io.removeModel('localstorage://demo/management/model1');
 *
 * // List models again.
 * console.log(JSON.stringify(await tf.io.listModels()));
 * ```
 *
 * @param url A URL to a stored model, with a scheme prefix, e.g.,
 *   'localstorage://my-model-1', 'indexeddb://my/model/2'.
 * @returns ModelArtifactsInfo of the deleted model (if and only if deletion
 *   is successful).
 * @throws Error if deletion fails, e.g., if no model exists at `path`.
 *
 * @doc {
 *   heading: 'Models',
 *   subheading: 'Management',
 *   namespace: 'io',
 *   ignoreCI: true
 * }
 */
declare function removeModel(url: string): Promise<ModelArtifactsInfo>;

/**
 * Additional options for Platform.fetch
 */
declare interface RequestDetails {
    /**
     * Is this request for a binary file (as opposed to a json file)
     */
    isBinary?: boolean;
}

declare function reset(instance: Human): void;

/**
 * Result interface definition for **Human** library
 *
 * Contains all possible detection results
 */
export declare interface Result {
    /** {@link FaceResult}: detection & analysis results */
    face: Array<FaceResult>;
    /** {@link BodyResult}: detection & analysis results */
    body: Array<BodyResult>;
    /** {@link HandResult}: detection & analysis results */
    hand: Array<HandResult>;
    /** {@link GestureResult}: detection & analysis results */
    gesture: Array<GestureResult>;
    /** {@link ObjectResult}: detection & analysis results */
    object: Array<ObjectResult>;
    /** global performance object with timing values for each operation */
    performance: Record<string, number>;
    /** optional processed canvas that can be used to draw input on screen */
    canvas?: AnyCanvas | null;
    /** timestamp of detection representing the milliseconds elapsed since the UNIX epoch */
    readonly timestamp: number;
    /** getter property that returns unified persons object  */
    persons: Array<PersonResult>;
    /** Last known error message */
    error: string | null;
}

/**
 * Options for saving a model.
 * @innamespace io
 */
declare interface SaveConfig {
    /**
     * Whether to save only the trainable weights of the model, ignoring the
     * non-trainable ones.
     */
    trainableOnly?: boolean;
    /**
     * Whether the optimizer will be saved (if exists).
     *
     * Default: `false`.
     */
    includeOptimizer?: boolean;
}

/**
 * Type definition for handlers of saving operations.
 */
declare type SaveHandler = (modelArtifact: ModelArtifacts) => Promise<SaveResult>;

/**
 * Result of a saving operation.
 */
declare interface SaveResult {
    /**
     * Information about the model artifacts saved.
     */
    modelArtifactsInfo: ModelArtifactsInfo;
    /**
     * HTTP responses from the server that handled the model-saving request (if
     * any). This is applicable only to server-based saving routes.
     */
    responses?: Response[];
    /**
     * Error messages and related data (if any).
     */
    errors?: Array<{} | string>;
}

/** Configures all body segmentation module
 * removes background from input containing person
 * if segmentation is enabled it will run as preprocessing task before any other model
 * alternatively leave it disabled and use it on-demand using human.segmentation method which can
 * remove background or replace it with user-provided background
 */
export declare interface SegmentationConfig extends GenericConfig {
    /** blur segmentation output by <number> pixels for more realistic image */
    blur: number;
}

/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
/// <amd-module name="@tensorflow/tfjs-core/dist/types" />
/** @docalias number[] */
declare interface ShapeMap {
    R0: number[];
    R1: [number];
    R2: [number, number];
    R3: [number, number, number];
    R4: [number, number, number, number];
    R5: [number, number, number, number, number];
    R6: [number, number, number, number, number, number];
}

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

declare interface SingleValueMap {
    bool: boolean;
    int32: number;
    float32: number;
    complex64: number;
    string: string;
}

export declare namespace Tensor { }

/**
 * A `tf.Tensor` object represents an immutable, multidimensional array of
 * numbers that has a shape and a data type.
 *
 * For performance reasons, functions that create tensors do not necessarily
 * perform a copy of the data passed to them (e.g. if the data is passed as a
 * `Float32Array`), and changes to the data will change the tensor. This is not
 * a feature and is not supported. To avoid this behavior, use the tensor before
 * changing the input data or create a copy with `copy = tf.add(yourTensor, 0)`.
 *
 * See `tf.tensor` for details on how to create a `tf.Tensor`.
 *
 * @doc {heading: 'Tensors', subheading: 'Classes'}
 */
export declare class Tensor<R extends Rank = Rank> {
    /** Unique id of this tensor. */
    readonly id: number;
    /**
     * Id of the bucket holding the data for this tensor. Multiple arrays can
     * point to the same bucket (e.g. when calling array.reshape()).
     */
    dataId: DataId;
    /** The shape of the tensor. */
    readonly shape: ShapeMap[R];
    /** Number of elements in the tensor. */
    readonly size: number;
    /** The data type for the array. */
    readonly dtype: DataType;
    /** The rank type for the array (see `Rank` enum). */
    readonly rankType: R;
    /** Whether this tensor has been globally kept. */
    kept: boolean;
    /** The id of the scope this tensor is being tracked in. */
    scopeId: number;
    /**
     * Number of elements to skip in each dimension when indexing. See
     * https://docs.scipy.org/doc/numpy/reference/generated/\
     * numpy.ndarray.strides.html
     */
    readonly strides: number[];
    constructor(shape: ShapeMap[R], dtype: DataType, dataId: DataId, id: number);
    readonly rank: number;
    /**
     * Returns a promise of `tf.TensorBuffer` that holds the underlying data.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    buffer<D extends DataType = 'float32'>(): Promise<TensorBuffer<R, D>>;
    /**
     * Returns a `tf.TensorBuffer` that holds the underlying data.
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    bufferSync<D extends DataType = 'float32'>(): TensorBuffer<R, D>;
    /**
     * Returns the tensor data as a nested array. The transfer of data is done
     * asynchronously.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    array(): Promise<ArrayMap[R]>;
    /**
     * Returns the tensor data as a nested array. The transfer of data is done
     * synchronously.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    arraySync(): ArrayMap[R];
    /**
     * Asynchronously downloads the values from the `tf.Tensor`. Returns a
     * promise of `TypedArray` that resolves when the computation has finished.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    data<D extends DataType = NumericDataType>(): Promise<DataTypeMap[D]>;
    /**
     * Copy the tensor's data to a new GPU resource. Comparing to the `dataSync()`
     * and `data()`, this method prevents data from being downloaded to CPU.
     *
     * For WebGL backend, the data will be stored on a densely packed texture.
     * This means that the texture will use the RGBA channels to store value.
     *
     * @param options:
     *     For WebGL,
     *         - customTexShape: Optional. If set, will use the user defined
     *     texture shape to create the texture.
     *
     * @returns For WebGL backend, a GPUData contains the new texture and
     *     its information.
     *     {
     *        tensorRef: The tensor that is associated with this texture,
     *        texture: WebGLTexture,
     *        texShape: [number, number] // [height, width]
     *     }
     *     Remember to dispose the GPUData after it is used by
     *     `res.tensorRef.dispose()`.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    dataToGPU(options?: DataToGPUOptions): GPUData;
    /**
     * Synchronously downloads the values from the `tf.Tensor`. This blocks the
     * UI thread until the values are ready, which can cause performance issues.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    dataSync<D extends DataType = NumericDataType>(): DataTypeMap[D];
    /** Returns the underlying bytes of the tensor's data. */
    bytes(): Promise<Uint8Array[] | Uint8Array>;
    /**
     * Disposes `tf.Tensor` from memory.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    dispose(): void;
    protected isDisposedInternal: boolean;
    readonly isDisposed: boolean;
    throwIfDisposed(): void;
    /**
     * Prints the `tf.Tensor`. See `tf.print` for details.
     *
     * @param verbose Whether to print verbose information about the tensor,
     *    including dtype and size.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    print(verbose?: boolean): void;
    /**
     * Returns a copy of the tensor. See `tf.clone` for details.
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    clone<T extends Tensor>(this: T): T;
    /**
     * Returns a human-readable description of the tensor. Useful for logging.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    toString(verbose?: boolean): string;
    variable(trainable?: boolean, name?: string, dtype?: DataType): Variable<R>;
}

/**
 * A mutable object, similar to `tf.Tensor`, that allows users to set values
 * at locations before converting to an immutable `tf.Tensor`.
 *
 * See `tf.buffer` for creating a tensor buffer.
 *
 * @doc {heading: 'Tensors', subheading: 'Classes'}
 */
declare class TensorBuffer<R extends Rank, D extends DataType = 'float32'> {
    dtype: D;
    size: number;
    shape: ShapeMap[R];
    strides: number[];
    values: DataTypeMap[D];
    constructor(shape: ShapeMap[R], dtype: D, values?: DataTypeMap[D]);
    /**
     * Sets a value in the buffer at a given location.
     *
     * @param value The value to set.
     * @param locs  The location indices.
     *
     * @doc {heading: 'Tensors', subheading: 'Creation'}
     */
    set(value: SingleValueMap[D], ...locs: number[]): void;
    /**
     * Returns the value in the buffer at the provided location.
     *
     * @param locs The location indices.
     *
     * @doc {heading: 'Tensors', subheading: 'Creation'}
     */
    get(...locs: number[]): SingleValueMap[D];
    locToIndex(locs: number[]): number;
    indexToLoc(index: number): number[];
    readonly rank: number;
    /**
     * Creates an immutable `tf.Tensor` object from the buffer.
     *
     * @doc {heading: 'Tensors', subheading: 'Creation'}
     */
    toTensor(): Tensor<R>;
}

declare interface TensorInfo {
    name: string;
    shape?: number[];
    dtype: DataType;
}

/** @docalias TypedArray|Array */
export declare type TensorLike = TypedArray | number | boolean | string | RecursiveArray<number | number[] | TypedArray> | RecursiveArray<boolean> | RecursiveArray<string> | Uint8Array[];

/** Model training configuration. */
declare interface TrainingConfig {
    /** Optimizer used for the model training. */
    optimizer_config: {};
    /** Loss function(s) for the model's output(s). */
    loss: string | string[] | {
        [key: string]: string;
    };
    /** Metric function(s) for the model's output(s). */
    metrics?: string[] | {
        [key: string]: string;
    };
    weighted_metrics?: string[];
    sample_weight_mode?: string;
    loss_weights?: number[] | {
        [key: string]: number;
    };
}

declare type TypedArray = Float32Array | Int32Array | Uint8Array;

declare function validate(instance: Human): Promise<void>;

/**
 * A mutable `tf.Tensor`, useful for persisting state, e.g. for training.
 *
 * @doc {heading: 'Tensors', subheading: 'Classes'}
 */
declare class Variable<R extends Rank = Rank> extends Tensor<R> {
    trainable: boolean;
    name: string;
    constructor(initialValue: Tensor<R>, trainable: boolean, name: string, tensorId: number);
    /**
     * Assign a new `tf.Tensor` to this variable. The new `tf.Tensor` must have
     * the same shape and dtype as the old `tf.Tensor`.
     *
     * @param newValue New tensor to be assigned to this variable.
     *
     * @doc {heading: 'Tensors', subheading: 'Classes'}
     */
    assign(newValue: Tensor<R>): void;
    dispose(): void;
}

/** Possible values for `human.warmup` */
export declare type WarmupType = ['' | 'none' | 'face' | 'full' | 'body'];

/**
 * Group to which the weight belongs.
 *
 * - 'optimizer': Weight from a stateful optimizer.
 */
declare type WeightGroup = 'model' | 'optimizer';

/**
 * Creates a function, which reads a weights manifest JSON configuration,
 * fetches the weight files using the specified function and returns them as
 * `Tensor`s.
 *
 * ```js
 * // example for creating a nodejs weight loader, which reads the weight files
 * // from disk using fs.readFileSync
 *
 * import * as fs from 'fs'
 *
 * const fetchWeightsFromDisk = (filePaths: string[]) =>
 *   filePaths.map(filePath => fs.readFileSync(filePath).buffer)
 *
 * const loadWeights = tf.io.weightsLoaderFactory(fetchWeightsFromDisk)
 *
 * const manifest = JSON.parse(
 *   fs.readFileSync('./my_model-weights_manifest').toString()
 * )
 * const weightMap = await loadWeights(manifest, './')
 * ```
 * @param fetchWeightsFunction The function used for fetching the weight files.
 * @returns Weight loading function.
 */
declare function weightsLoaderFactory(fetchWeightsFunction: (fetchUrls: string[]) => Promise<ArrayBuffer[]>): (manifest: WeightsManifestConfig, filePathPrefix?: string, weightNames?: string[]) => Promise<NamedTensorMap>;

/**
 * A weight manifest.
 *
 * The weight manifest consists of an ordered list of weight-manifest groups.
 * Each weight-manifest group ("group" for short hereafter) consists of a
 * number of weight values stored in a number of paths.
 * See the documentation of `WeightManifestGroupConfig` below for more details.
 */
declare type WeightsManifestConfig = WeightsManifestGroupConfig[];

/**
 * An entry in the weight manifest.
 *
 * The entry contains specification of a weight.
 */
declare interface WeightsManifestEntry {
    /**
     * Name of the weight, e.g., 'Dense_1/bias'
     */
    name: string;
    /**
     * Shape of the weight.
     */
    shape: number[];
    /**
     * Data type of the weight.
     */
    dtype: 'float32' | 'int32' | 'bool' | 'string' | 'complex64';
    /**
     * Type of the weight.
     *
     * Optional.
     *
     * The value 'optimizer' indicates the weight belongs to an optimizer
     * (i.e., used only during model training and not during inference).
     */
    group?: WeightGroup;
    /**
     * Information for dequantization of the weight.
     */
    quantization?: {
        scale?: number;
        min?: number;
        dtype: 'uint16' | 'uint8' | 'float16';
    };
}

/**
 * A weight-manifest group.
 *
 * Consists of an ordered list of weight values encoded in binary format,
 * stored in an ordered list of paths.
 */
declare interface WeightsManifestGroupConfig {
    /**
     * An ordered list of paths.
     *
     * Paths are intentionally abstract in order to be general. For example, they
     * can be relative URL paths or relative paths on the file system.
     */
    paths: string[];
    /**
     * Specifications of the weights stored in the paths.
     */
    weights: WeightsManifestEntry[];
}

/**
 * Creates an IOHandler that passes saved model artifacts to a callback.
 *
 * ```js
 * function handleSave(artifacts) {
 *   // ... do something with the artifacts ...
 *   return {modelArtifactsInfo: {...}, ...};
 * }
 *
 * const saveResult = model.save(tf.io.withSaveHandler(handleSave));
 * ```
 *
 * @param saveHandler A function that accepts a `ModelArtifacts` and returns a
 *     `SaveResult`.
 */
declare function withSaveHandler(saveHandler: (artifacts: ModelArtifacts) => Promise<SaveResult>): IOHandler;

export { }
