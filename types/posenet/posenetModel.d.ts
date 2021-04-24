export declare class BaseModel {
    model: any;
    inputSize: number;
    constructor(model: any);
    predict(input: any): any;
    dispose(): void;
}
