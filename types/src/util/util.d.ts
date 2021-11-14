/**
 * Simple helper functions used accross codebase
 */
export declare function log(...msg: any[]): void;
export declare function join(folder: string, file: string): string;
export declare const now: () => number;
export declare function validate(defaults: any, config: any, parent?: string, msgs?: Array<{
    reason: string;
    where: string;
    expected?: string;
}>): {
    reason: string;
    where: string;
    expected?: string;
}[];
export declare function mergeDeep(...objects: any[]): any;
export declare const minmax: (data: Array<number>) => number[];
export declare function wait(time: any): Promise<void>;
