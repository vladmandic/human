export declare function eitherPointDoesntMeetConfidence(a: any, b: any, minConfidence: any): boolean;
export declare function getAdjacentKeyPoints(keypoints: any, minConfidence: any): any[];
export declare function getBoundingBox(keypoints: any): any;
export declare function getBoundingBoxPoints(keypoints: any): {
    x: any;
    y: any;
}[];
export declare function toTensorBuffers3D(tensors: any): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
export declare function scalePose(pose: any, scaleY: any, scaleX: any): {
    score: any;
    keypoints: any;
};
export declare function resizeTo(image: any, [targetH, targetW]: [any, any]): any;
export declare function scaleAndFlipPoses(poses: any, [height, width]: [any, any], [inputResolutionHeight, inputResolutionWidth]: [any, any]): any;
