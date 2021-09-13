/**
 * Type definitions for Human result object
 */
import type { Tensor } from './tfjs/types';
import type { FaceGesture, BodyGesture, HandGesture, IrisGesture } from './gesture/gesture';
/** Face results
 * Combined results of face detector, face mesh, age, gender, emotion, embedding, iris models
 * Some values may be null if specific model is not enabled
 *
 * Each result has:
 * - id: face id number
 * - score: overal detection confidence score value
 * - boxScore: face box detection confidence score value
 * - faceScore: face keypoints detection confidence score value
 * - box: face bounding box as array of [x, y, width, height], normalized to image resolution
 * - boxRaw: face bounding box as array of [x, y, width, height], normalized to range 0..1
 * - mesh: face keypoints as array of [x, y, z] points of face mesh, normalized to image resolution
 * - meshRaw: face keypoints as array of [x, y, z] points of face mesh, normalized to range 0..1
 * - annotations: annotated face keypoints as array of annotated face mesh points
 * - age: age as value
 * - gender: gender as value
 * - genderScore: gender detection confidence score as value
 * - emotion: emotions as array of possible emotions with their individual scores
 * - embedding: facial descriptor as array of numerical elements
 * - iris: iris distance from current viewpoint as distance value in centimeters for a typical camera
 *   field of view of 88 degrees. value should be adjusted manually as needed
 * - rotation: face rotiation that contains both angles and matrix used for 3d transformations
 *  - angle: face angle as object with values for roll, yaw and pitch angles
 *  - matrix: 3d transofrmation matrix as array of numeric values
 *  - gaze: gaze direction as object with values for bearing in radians and relative strength
 * - tensor: face tensor as Tensor object which contains detected face
 */
export interface FaceResult {
    id: number;
    score: number;
    boxScore: number;
    faceScore: number;
    box: [number, number, number, number];
    boxRaw: [number, number, number, number];
    mesh: Array<[number, number, number]>;
    meshRaw: Array<[number, number, number]>;
    annotations: Record<string, Array<[number, number, number]>>;
    age?: number;
    gender?: string;
    genderScore?: number;
    emotion?: Array<{
        score: number;
        emotion: string;
    }>;
    embedding?: Array<number>;
    iris?: number;
    rotation?: {
        angle: {
            roll: number;
            yaw: number;
            pitch: number;
        };
        matrix: [number, number, number, number, number, number, number, number, number];
        gaze: {
            bearing: number;
            strength: number;
        };
    };
    tensor?: Tensor;
}
/** Body results
 *
 * Each results has:
 * - id: body id number
 * - score: overall detection score
 * - box: bounding box: x, y, width, height normalized to input image resolution
 * - boxRaw: bounding box: x, y, width, height normalized to 0..1
 * - keypoints: array of keypoints
 *  - part: body part name
 *  - position: body part position with x,y,z coordinates
 *  - score: body part score value
 *  - presence: body part presence value
 */
export interface BodyResult {
    id: number;
    score: number;
    box: [number, number, number, number];
    boxRaw: [number, number, number, number];
    keypoints: Array<{
        part: string;
        position: [number, number, number?];
        positionRaw: [number, number, number?];
        score: number;
        presence?: number;
    }>;
}
/** Hand results
 *
 * Each result has:
 * - id: hand id number
 * - score: detection confidence score as value
 * - box: bounding box: x, y, width, height normalized to input image resolution
 * - boxRaw: bounding box: x, y, width, height normalized to 0..1
 * - keypoints: keypoints as array of [x, y, z] points of hand, normalized to image resolution
 * - annotations: annotated landmarks for each hand part with keypoints
 * - landmarks: annotated landmarks for eachb hand part with logical curl and direction strings
 */
export interface HandResult {
    id: number;
    score: number;
    box: [number, number, number, number];
    boxRaw: [number, number, number, number];
    keypoints: Array<[number, number, number]>;
    annotations: Record<'index' | 'middle' | 'pinky' | 'ring' | 'thumb' | 'palm', Array<[number, number, number]>>;
    landmarks: Record<'index' | 'middle' | 'pinky' | 'ring' | 'thumb', {
        curl: 'none' | 'half' | 'full';
        direction: 'verticalUp' | 'verticalDown' | 'horizontalLeft' | 'horizontalRight' | 'diagonalUpRight' | 'diagonalUpLeft' | 'diagonalDownRight' | 'diagonalDownLeft';
    }>;
}
/** Object results
*
* Array of individual results with one object per detected gesture
* Each result has:
* - id: object id number
* - score as value
* - label as detected class name
* - box: bounding box: x, y, width, height normalized to input image resolution
* - boxRaw: bounding box: x, y, width, height normalized to 0..1
* - center: optional center point as array of [x, y], normalized to image resolution
* - centerRaw: optional center point as array of [x, y], normalized to range 0..1
*/
export interface ObjectResult {
    id: number;
    score: number;
    class: number;
    label: string;
    box: [number, number, number, number];
    boxRaw: [number, number, number, number];
}
/** Gesture results
 * @typedef Gesture Type
 *
 * Array of individual results with one object per detected gesture
 * Each result has:
 * - part: part name and number where gesture was detected: face, iris, body, hand
 * - gesture: gesture detected
 */
export declare type GestureResult = {
    'face': number;
    gesture: FaceGesture;
} | {
    'iris': number;
    gesture: IrisGesture;
} | {
    'body': number;
    gesture: BodyGesture;
} | {
    'hand': number;
    gesture: HandGesture;
};
/** Person getter
* @interface Person Interface
*
* Each result has:
* - id: person id
* - face: face object
* - body: body object
* - hands: array of hand objects
* - gestures: array of gestures
* - box: bounding box: x, y, width, height normalized to input image resolution
* - boxRaw: bounding box: x, y, width, height normalized to 0..1
*/
export interface PersonResult {
    id: number;
    face: FaceResult;
    body: BodyResult | null;
    hands: {
        left: HandResult | null;
        right: HandResult | null;
    };
    gestures: Array<GestureResult>;
    box: [number, number, number, number];
    boxRaw?: [number, number, number, number];
}
/**
 * Result interface definition for **Human** library
 *
 * Contains all possible detection results
 */
export interface Result {
    /** {@link FaceResult}: detection & analysis results */
    face: Array<FaceResult>;
    /** {@link BodyResult}: detection & analysis results */
    body: Array<BodyResult>;
    /** {@link HandResult}: detection & analysis results */
    hand: Array<HandResult>;
    /** {@link GestureResult}: detection & analysis results */
    gesture: Array<GestureResult>;
    /** {@link ItemResult}: detection & analysis results */
    object: Array<ObjectResult>;
    /** global performance object with timing values for each operation */
    performance: Record<string, unknown>;
    /** optional processed canvas that can be used to draw input on screen */
    canvas?: OffscreenCanvas | HTMLCanvasElement | null | undefined;
    /** timestamp of detection representing the milliseconds elapsed since the UNIX epoch */
    readonly timestamp: number;
    /** getter property that returns unified persons object  */
    persons: Array<PersonResult>;
}
//# sourceMappingURL=result.d.ts.map