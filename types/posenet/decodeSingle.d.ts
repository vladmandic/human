export declare function decodePose(root: any, scores: any, offsets: any, outputStride: any, displacementsFwd: any, displacementsBwd: any): any[];
export declare function decodeSinglePose(heatmapScores: any, offsets: any, minScore: any): Promise<{
    keypoints: {
        position: {
            y: any;
            x: any;
        };
        part: string;
        score: number;
    }[];
    box: any[];
    score: number;
}>;
