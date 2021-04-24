export declare class PoseNet {
    baseModel: any;
    inputSize: number;
    constructor(baseModel: any);
    estimatePoses(input: any, config: any): Promise<unknown>;
    dispose(): void;
}
export declare function load(config: any): Promise<PoseNet>;
