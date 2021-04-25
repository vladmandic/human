export declare function predict(input: any, config: any): Promise<{
    confidence: number;
    box: any;
    boxRaw: any;
    landmarks: any;
    annotations: any;
}[]>;
export declare function load(config: any): Promise<[Object, Object]>;
