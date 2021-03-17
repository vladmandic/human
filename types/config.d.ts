/**
 * Configuration interface definition for **Human** library
 *
 * Contains all configurable parameters
 */
export interface Config {
    backend: String;
    wasmPath: String;
    debug: Boolean;
    async: Boolean;
    profile: Boolean;
    deallocate: Boolean;
    scoped: Boolean;
    videoOptimized: Boolean;
    warmup: String;
    filter: {
        enabled: Boolean;
        width: Number;
        height: Number;
        return: Boolean;
        brightness: Number;
        contrast: Number;
        sharpness: Number;
        blur: Number;
        saturation: Number;
        hue: Number;
        negative: Boolean;
        sepia: Boolean;
        vintage: Boolean;
        kodachrome: Boolean;
        technicolor: Boolean;
        polaroid: Boolean;
        pixelate: Number;
    };
    gesture: {
        enabled: Boolean;
    };
    face: {
        enabled: Boolean;
        detector: {
            modelPath: String;
            rotation: Boolean;
            maxFaces: Number;
            skipFrames: Number;
            skipInitial: Boolean;
            minConfidence: Number;
            iouThreshold: Number;
            scoreThreshold: Number;
            return: Boolean;
        };
        mesh: {
            enabled: Boolean;
            modelPath: String;
        };
        iris: {
            enabled: Boolean;
            modelPath: String;
        };
        age: {
            enabled: Boolean;
            modelPath: String;
            skipFrames: Number;
        };
        gender: {
            enabled: Boolean;
            minConfidence: Number;
            modelPath: String;
            skipFrames: Number;
        };
        emotion: {
            enabled: Boolean;
            minConfidence: Number;
            skipFrames: Number;
            modelPath: String;
        };
        embedding: {
            enabled: Boolean;
            modelPath: String;
        };
    };
    body: {
        enabled: Boolean;
        modelPath: String;
        maxDetections: Number;
        scoreThreshold: Number;
        nmsRadius: Number;
    };
    hand: {
        enabled: Boolean;
        rotation: Boolean;
        skipFrames: Number;
        skipInitial: Boolean;
        minConfidence: Number;
        iouThreshold: Number;
        scoreThreshold: Number;
        maxHands: Number;
        landmarks: Boolean;
        detector: {
            modelPath: String;
        };
        skeleton: {
            modelPath: String;
        };
    };
    object: {
        enabled: Boolean;
        modelPath: String;
        minConfidence: Number;
        iouThreshold: Number;
        maxResults: Number;
        skipFrames: Number;
    };
}
declare const config: Config;
export { config as defaults };
