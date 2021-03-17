declare const _default: {
    backend: string;
    wasmPath: string;
    debug: boolean;
    async: boolean;
    profile: boolean;
    deallocate: boolean;
    scoped: boolean;
    videoOptimized: boolean;
    warmup: string;
    filter: {
        enabled: boolean;
        width: number;
        height: number;
        return: boolean;
        brightness: number;
        contrast: number;
        sharpness: number;
        blur: number;
        saturation: number;
        hue: number;
        negative: boolean;
        sepia: boolean;
        vintage: boolean;
        kodachrome: boolean;
        technicolor: boolean;
        polaroid: boolean;
        pixelate: number;
    };
    gesture: {
        enabled: boolean;
    };
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
        age: {
            enabled: boolean;
            modelPath: string;
            skipFrames: number;
        };
        gender: {
            enabled: boolean;
            minConfidence: number;
            modelPath: string;
            skipFrames: number;
        };
        emotion: {
            enabled: boolean;
            minConfidence: number;
            skipFrames: number;
            modelPath: string;
        };
        embedding: {
            enabled: boolean;
            modelPath: string;
        };
    };
    body: {
        enabled: boolean;
        modelPath: string;
        maxDetections: number;
        scoreThreshold: number;
        nmsRadius: number;
    };
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
    object: {
        enabled: boolean;
        modelPath: string;
        minConfidence: number;
        iouThreshold: number;
        maxResults: number;
        skipFrames: number;
    };
};
export default _default;
