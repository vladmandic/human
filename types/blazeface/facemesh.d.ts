export declare function predict(input: any, config: any): Promise<{
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
export declare function load(config: any): Promise<[Object, Object, Object]>;
export declare const triangulation: number[];
export declare const uvmap: number[][];
