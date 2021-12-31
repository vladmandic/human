/**
 * Type definitions for Human result object
 */

import type { Tensor } from './tfjs/types';
import type { FaceGesture, BodyGesture, HandGesture, IrisGesture } from './gesture/gesture';
import type { AnyCanvas } from './exports';

/** generic box as [x, y, width, height] */
export type Box = [number, number, number, number];
/** generic point as [x, y, z?] */
export type Point = [number, number, number?];

export type Emotion = 'angry' | 'disgust' | 'fear' | 'happy' | 'sad' | 'surprise' | 'neutral';
export type Gender = 'male' | 'female' | 'unknown';
export type Race = 'white' | 'black' | 'asian' | 'indian' | 'other';
export type FaceLandmark = 'leftEye' | 'rightEye' | 'nose' | 'mouth' | 'leftEar' | 'rightEar' | 'symmetryLine' | 'silhouette'
 | 'lipsUpperOuter' | 'lipsLowerOuter' | 'lipsUpperInner' | 'lipsLowerInner'
 | 'rightEyeUpper0' | 'rightEyeLower0' | 'rightEyeUpper1' | 'rightEyeLower1' | 'rightEyeUpper2' | 'rightEyeLower2' | 'rightEyeLower3' | 'rightEyebrowUpper' | 'rightEyebrowLower' | 'rightEyeIris'
 | 'leftEyeUpper0' | 'leftEyeLower0' | 'leftEyeUpper1' | 'leftEyeLower1' | 'leftEyeUpper2' | 'leftEyeLower2' | 'leftEyeLower3' | 'leftEyebrowUpper' | 'leftEyebrowLower' | 'leftEyeIris'
 | 'midwayBetweenEyes' | 'noseTip' | 'noseBottom' | 'noseRightCorner' | 'noseLeftCorner' | 'rightCheek' | 'leftCheek';

/** Face results
 * - Combined results of face detector, face mesh, age, gender, emotion, embedding, iris models
 * - Some values may be null if specific model is not enabled
 */
export interface FaceResult {
  /** face id */
  id: number
  /** overall face score */
  score: number,
  /** detection score */
  boxScore: number,
  /** mesh score */
  faceScore: number,
  /** detected face box */
  box: Box,
  /** detected face box normalized to 0..1 */
  boxRaw: Box,
  /** detected face mesh */
  mesh: Array<Point>
  /** detected face mesh normalized to 0..1 */
  meshRaw: Array<Point>
  /** mesh keypoints combined into annotated results */
  annotations: Record<FaceLandmark, Point[]>,
  /** detected age */
  age?: number,
  /** detected gender */
  gender?: Gender,
  /** gender detection score */
  genderScore?: number,
  /** detected emotions */
  emotion?: Array<{ score: number, emotion: Emotion }>,
  /** detected race */
  race?: Array<{ score: number, race: Race }>,
  /** face descriptor */
  embedding?: Array<number>,
  /** face iris distance from camera */
  iris?: number,
  /** face anti-spoofing result confidence */
  real?: number,
  /** face liveness result confidence */
  live?: number,
  /** face rotation details */
  rotation?: {
    angle: { roll: number, yaw: number, pitch: number },
    matrix: [number, number, number, number, number, number, number, number, number],
    gaze: { bearing: number, strength: number },
  } | null,
  /** detected face as tensor that can be used in further pipelines */
  tensor?: Tensor,
}

export type BodyLandmarkPoseNet = 'nose' | 'leftEye' | 'rightEye' | 'leftEar' | 'rightEar' | 'leftShoulder' | 'rightShoulder' | 'leftElbow' | 'rightElbow' | 'leftWrist' | 'rightWrist' | 'leftHip' | 'rightHip' | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle';
export type BodyLandmarkMoveNet = 'nose' | 'leftEye' | 'rightEye' | 'leftEar' | 'rightEar' | 'leftShoulder' | 'rightShoulder' | 'leftElbow' | 'rightElbow' | 'leftWrist' | 'rightWrist' | 'leftHip' | 'rightHip' | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle';
export type BodyLandmarkEfficientNet = 'head' | 'neck' | 'rightShoulder' | 'rightElbow' | 'rightWrist' | 'chest' | 'leftShoulder' | 'leftElbow' | 'leftWrist' | 'bodyCenter' | 'rightHip' | 'rightKnee' | 'rightAnkle' | 'leftHip' | 'leftKnee' | 'leftAnkle';
export type BodyLandmarkBlazePose = 'nose' | 'leftEyeInside' | 'leftEye' | 'leftEyeOutside' | 'rightEyeInside' | 'rightEye' | 'rightEyeOutside' | 'leftEar' | 'rightEar' | 'leftMouth' | 'rightMouth' | 'leftShoulder' | 'rightShoulder'
  | 'leftElbow' | 'rightElbow' | 'leftWrist' | 'rightWrist' | 'leftPinky' | 'rightPinky' | 'leftIndex' | 'rightIndex' | 'leftThumb' | 'rightThumb' | 'leftHip' | 'rightHip' | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle'
  | 'leftHeel' | 'rightHeel' | 'leftFoot' | 'rightFoot' | 'bodyCenter' | 'bodyTop' | 'leftPalm' | 'leftHand' | 'rightPalm' | 'rightHand';
export type BodyLandmark = BodyLandmarkPoseNet | BodyLandmarkMoveNet | BodyLandmarkEfficientNet | BodyLandmarkBlazePose;
export type BodyAnnotationBlazePose = 'leftLeg' | 'rightLeg' | 'torso' | 'leftArm' | 'rightArm' | 'leftEye' | 'rightEye' | 'mouth';
export type BodyAnnotationEfficientPose = 'leftLeg' | 'rightLeg' | 'torso' | 'leftArm' | 'rightArm' | 'head';
export type BodyAnnotation = BodyAnnotationBlazePose | BodyAnnotationEfficientPose;

/** Body Result keypoints */
export interface BodyKeypoint {
  /** body part name */
  part: BodyLandmark,
  /** body part position */
  position: Point,
  /** body part position normalized to 0..1 */
  positionRaw: Point,
  /** body part position relative to body center in meters */
  distance?: Point,
  /** body part detection score */
  score: number,
}

/** Body results */
export interface BodyResult {
  /** body id */
  id: number,
  /** body detection score */
  score: number,
  /** detected body box */
  box: Box,
  /** detected body box normalized to 0..1 */
  boxRaw: Box,
  /** detected body keypoints */
  keypoints: Array<BodyKeypoint>
  /** detected body keypoints combined into annotated parts */
  annotations: Record<BodyAnnotation, Point[][]>,
}

export type HandType = 'hand' | 'fist' | 'pinch' | 'point' | 'face' | 'tip' | 'pinchtip';
export type Finger = 'index' | 'middle' | 'pinky' | 'ring' | 'thumb' | 'palm';
export type FingerCurl = 'none' | 'half' | 'full';
export type FingerDirection = 'verticalUp' | 'verticalDown' | 'horizontalLeft' | 'horizontalRight' | 'diagonalUpRight' | 'diagonalUpLeft' | 'diagonalDownRight' | 'diagonalDownLeft';

/** Hand results */
export interface HandResult {
  /** hand id */
  id: number,
  /** hand overal score */
  score: number,
  /** hand detection score */
  boxScore: number,
  /** hand skelton score */
  fingerScore: number,
  /** detected hand box */
  box: Box,
  /** detected hand box normalized to 0..1 */
  boxRaw: Box,
  /** detected hand keypoints */
  keypoints: Array<Point>,
  /** detected hand class */
  label: HandType,
  /** detected hand keypoints combined into annotated parts */
  annotations: Record<Finger, Array<Point>>,
  /** detected hand parts annotated with part gestures */
  landmarks: Record<Finger, { curl: FingerCurl, direction: FingerDirection }>,
}

export type ObjectType = 'person' | 'bicycle' | 'car' | 'motorcycle' | 'airplane' | 'bus' | 'train' | 'truck' | 'boat' | 'traffic light' | 'fire hydrant' | 'stop sign' | 'parking meter'
  | 'bench' | 'bird' | 'cat' | 'dog' | 'horse' | 'sheep' | 'cow' | 'elephant' | 'bear' | 'zebra' | 'giraffe' | 'backpack' | 'umbrella' | 'handbag' | 'tie' | 'suitcase' | 'frisbee'
  | 'skis' | 'snowboard' | 'sports ball' | 'kite' | 'baseball bat' | 'baseball glove' | 'skateboard' | 'surfboard' | 'tennis racket' | 'bottle' | 'wine glass' | 'cup' | 'fork'
  | 'knife' | 'spoon' | 'bowl' | 'banana' | 'apple' | 'sandwich' | 'orange' | 'broccoli' | 'carrot' | 'hot dog' | 'pizza' | 'donut' | 'cake' | 'chair' | 'couch' | 'potted plant'
  | 'bed' | 'dining table' | 'toilet' | 'tv' | 'laptop' | 'mouse' | 'remote' | 'keyboard' | 'cell phone' | 'microwave' | 'oven' | 'toaster' | 'sink' | 'refrigerator' | 'book'
  | 'clock' | 'vase' | 'scissors' | 'teddy bear' | 'hair drier' | 'toothbrush';

/** Object results */
export interface ObjectResult {
  /** object id */
  id: number,
  /** object detection score */
  score: number,
  /** detected object class id */
  class: number,
  /** detected object class name */
  label: ObjectType,
  /** detected object box */
  box: Box,
  /** detected object box normalized to 0..1 */
  boxRaw: Box,
}

/** Gesture combined results
 * Each result has:
 * - part: part name and number where gesture was detected: `face`, `iris`, `body`, `hand`
 * - gesture: gesture detected
 */
export type GestureResult =
  { 'face': number, gesture: FaceGesture }
  | { 'iris': number, gesture: IrisGesture }
  | { 'body': number, gesture: BodyGesture }
  | { 'hand': number, gesture: HandGesture }

/** Person getter
* - Triggers combining all individual results into a virtual person object
*/
export interface PersonResult {
  /** person id */
  id: number,
  /** face result that belongs to this person */
  face: FaceResult,
  /** body result that belongs to this person */
  body: BodyResult | null,
  /** left and right hand results that belong to this person */
  hands: { left: HandResult | null, right: HandResult | null },
  /** detected gestures specific to this person */
  gestures: Array<GestureResult>,
  /** box that defines the person */
  box: Box,
  /** box that defines the person normalized to 0..1 */
  boxRaw?: Box,
}

/**
 * Result interface definition for **Human** library
 *
 * Contains all possible detection results
 */
export interface Result {
  /** {@link FaceResult}: detection & analysis results */
  face: Array<FaceResult>,
  /** {@link BodyResult}: detection & analysis results */
  body: Array<BodyResult>,
  /** {@link HandResult}: detection & analysis results */
  hand: Array<HandResult>,
  /** {@link GestureResult}: detection & analysis results */
  gesture: Array<GestureResult>,
  /** {@link ObjectResult}: detection & analysis results */
  object: Array<ObjectResult>
  /** global performance object with timing values for each operation */
  performance: Record<string, number>,
  /** optional processed canvas that can be used to draw input on screen */
  canvas?: AnyCanvas | null,
  /** timestamp of detection representing the milliseconds elapsed since the UNIX epoch */
  readonly timestamp: number,
  /** getter property that returns unified persons object  */
  persons: Array<PersonResult>,
  /** Last known error message */
  error: string | null;
}
