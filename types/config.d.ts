/**
 * Configuration interface definition for **Human** library
 *
 * Contains all configurable parameters
 */
export interface Config {
    /** Backend used for TFJS operations */
    backend: null | '' | 'cpu' | 'wasm' | 'webgl' | 'humangl' | 'tensorflow';
    /** Path to *.wasm files if backend is set to `wasm` */
    wasmPath: string;
    /** Print debug statements to console */
    debug: boolean;
    /** Perform model loading and inference concurrently or sequentially */
    async: boolean;
    /** Collect and print profiling data during inference operations */
    profile: boolean;
    /** Internal: Use aggressive GPU memory deallocator when backend is set to `webgl` or `humangl` */
    deallocate: boolean;
    /** Internal: Run all inference operations in an explicit local scope run to avoid memory leaks */
    scoped: boolean;
    /** Perform additional optimizations when input is video,
     * - must be disabled for images
     * - automatically disabled for Image, ImageData, ImageBitmap and Tensor inputs
     * - skips boundary detection for every `skipFrames` frames specified for each model
     * - while maintaining in-box detection since objects don't change definition as fast */
    videoOptimized: boolean;
    /** What to use for `human.warmup()`
     * - warmup pre-initializes all models for faster inference but can take significant time on startup
     * - only used for `webgl` and `humangl` backends
    */
    warmup: 'none' | 'face' | 'full' | 'body';
    /** Base model path (typically starting with file://, http:// or https://) for all models
     * - individual modelPath values are joined to this path
    */
    modelBasePath: string;
    /** Run input through image filters before inference
     * - image filters run with near-zero latency as they are executed on the GPU
    */
    filter: {
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
    };
    /** Controlls gesture detection */
    gesture: {
        enabled: boolean;
    };
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
        enabled: boolean;
        detector: {
            modelPath: string;
            rotation: boolean;
            maxFaces: number;
            skipFrames: number;
            skipInitial: boolean;
            minConfidence: number;
            iouThreshold: number;
            scoreThreshold: number;
            return: boolean;
        };
        mesh: {
            enabled: boolean;
            modelPath: string;
        };
        iris: {
            enabled: boolean;
            modelPath: string;
        };
        description: {
            enabled: boolean;
            modelPath: string;
            skipFrames: number;
            minConfidence: number;
        };
        emotion: {
            enabled: boolean;
            minConfidence: number;
            skipFrames: number;
            modelPath: string;
        };
    };
    /** Controlls and configures all body detection specific options
     * - enabled: true/false
     * - modelPath: paths for both hand detector model and hand skeleton model
     * - maxDetections: maximum number of people detected in the input, should be set to the minimum number for performance
     * - scoreThreshold: threshold for deciding when to remove people based on score in non-maximum suppression
     * - nmsRadius: threshold for deciding whether body parts overlap too much in non-maximum suppression
    */
    body: {
        enabled: boolean;
        modelPath: string;
        maxDetections: number;
        scoreThreshold: number;
        nmsRadius: number;
    };
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
        enabled: boolean;
        rotation: boolean;
        skipFrames: number;
        skipInitial: boolean;
        minConfidence: number;
        iouThreshold: number;
        scoreThreshold: number;
        maxHands: number;
        landmarks: boolean;
        detector: {
            modelPath: string;
        };
        skeleton: {
            modelPath: string;
        };
    };
    /** Controlls and configures all object detection specific options
     * - minConfidence: minimum score that detection must have to return as valid object
     * - iouThreshold: ammount of overlap between two detected objects before one object is removed
     * - maxResults: maximum number of detections to return
     * - skipFrames: run object detection every n input frames, only valid if videoOptimized is set to true
    */
    object: {
        enabled: boolean;
        modelPath: string;
        minConfidence: number;
        iouThreshold: number;
        maxResults: number;
        skipFrames: number;
    };
}
declare const config: Config;
export { config as defaults };
