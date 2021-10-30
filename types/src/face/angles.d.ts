export declare const calculateFaceAngle: (face: any, imageSize: any) => {
    angle: {
        pitch: number;
        yaw: number;
        roll: number;
    };
    matrix: [number, number, number, number, number, number, number, number, number];
    gaze: {
        bearing: number;
        strength: number;
    };
};
