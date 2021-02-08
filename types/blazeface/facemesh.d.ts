export declare class MediaPipeFaceMesh {
    facePipeline: any;
    config: any;
    constructor(blazeFace: any, blazeMeshModel: any, irisModel: any, config: any);
    estimateFaces(input: any, config: any): Promise<{}[]>;
}
export declare function load(config: any): Promise<MediaPipeFaceMesh>;
