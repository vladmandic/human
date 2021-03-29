export declare class MediaPipeFaceMesh {
    facePipeline: any;
    config: any;
    constructor(blazeFace: any, blazeMeshModel: any, irisModel: any, config: any);
    estimateFaces(input: any, config: any): Promise<{
        confidence: any;
        boxConfidence: any;
        faceConfidence: any;
        box: any;
        mesh: any;
        boxRaw: any;
        meshRaw: any;
        annotations: any;
        image: any;
    }[]>;
}
export declare function load(config: any): Promise<MediaPipeFaceMesh>;
export declare const triangulation: number[];
export declare const uvmap: number[][];
