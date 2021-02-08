export declare class FaceBoxes {
    enlarge: number;
    model: any;
    config: any;
    constructor(model: any, config: any);
    estimateFaces(input: any, config: any): Promise<{
        confidence: number;
        box: any;
        boxRaw: any;
        image: any;
    }[]>;
}
export declare function load(config: any): Promise<FaceBoxes>;
