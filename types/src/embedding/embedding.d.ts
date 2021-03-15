declare type Tensor = {};
export declare function load(config: any): Promise<any>;
export declare function simmilarity(embedding1: any, embedding2: any, order?: number): Number;
export declare function match(embedding: Array<Number>, db: Array<any>, threshold?: number): {
    simmilarity: number;
    name: string;
    source: string;
    embedding: never[];
};
export declare function enhance(input: any): Tensor;
export declare function predict(input: any, config: any): Promise<number[]>;
export {};
