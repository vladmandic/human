export declare function load(config: any): Promise<any>;
export declare function predict(image: any, config: any): Promise<{
    keypoints: {
        id: any;
        part: any;
        position: {
            x;
            y;
            z;
        };
        score: any;
        presence: any;
    }[];
}[] | null>;
