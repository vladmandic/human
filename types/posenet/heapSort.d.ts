export declare class MaxHeap {
    priorityQueue: any;
    numberOfElements: number;
    getElementValue: any;
    constructor(maxSize: any, getElementValue: any);
    enqueue(x: any): void;
    dequeue(): any;
    empty(): boolean;
    size(): number;
    all(): any;
    max(): any;
    swim(k: any): void;
    sink(k: any): void;
    getValueAt(i: any): any;
    less(i: any, j: any): boolean;
    exchange(i: any, j: any): void;
}
