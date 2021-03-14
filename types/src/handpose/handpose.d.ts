export declare class HandPose {
    handPipeline: any;
    constructor(handPipeline: any);
    static getAnnotations(): {
        thumb: number[];
        indexFinger: number[];
        middleFinger: number[];
        ringFinger: number[];
        pinky: number[];
        palmBase: number[];
    };
    estimateHands(input: any, config: any): Promise<{
        confidence: number;
        box: any;
        landmarks: any;
        annotations: any;
    }[]>;
}
export declare function load(config: any): Promise<HandPose>;
