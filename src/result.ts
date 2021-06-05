/**
 * Type definitions for Human result object
 */

import { Tensor } from './tfjs/types';

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
export interface Face {
  id: number
  score: number,
  boxScore: number,
  faceScore: number,
  box: [number, number, number, number],
  boxRaw: [number, number, number, number],
  mesh: Array<[number, number, number]>
  meshRaw: Array<[number, number, number]>
  annotations: Record<string, Array<[number, number, number]>>,
  age?: number,
  gender?: string,
  genderScore?: number,
  emotion?: Array<{ score: number, emotion: string }>,
  embedding?: Array<number>,
  iris?: number,
  rotation?: {
    angle: { roll: number, yaw: number, pitch: number },
    matrix: [number, number, number, number, number, number, number, number, number],
    gaze: { bearing: number, strength: number },
  }
  image?: Tensor;
  tensor: Tensor,
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
export interface Body {
  id: number,
  score: number,
  box: [number, number, number, number],
  boxRaw: [number, number, number, number],
  keypoints: Array<{
    part: string,
    position: [number, number, number?],
    positionRaw: [number, number, number?],
    score: number,
    presence?: number,
  }>
}

/** Hand results
 *
 * Each result has:
 * - id: hand id number
 * - score: detection confidence score as value
 * - box: bounding box: x, y, width, height normalized to input image resolution
 * - boxRaw: bounding box: x, y, width, height normalized to 0..1
 * - landmarks: landmarks as array of [x, y, z] points of hand, normalized to image resolution
 * - annotations: annotated landmarks for each hand part
 */
export interface Hand {
  id: number,
  score: number,
  box: [number, number, number, number],
  boxRaw: [number, number, number, number],
  keypoints: Array<[number, number, number]>,
  annotations: Record<string, Array<[number, number, number]>>,
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
export interface Item {
  id: number,
  score: number,
  class: number,
  label: string,
  box: [number, number, number, number],
  boxRaw: [number, number, number, number],
}

/** Gesture results
 * @typedef Gesture Type
 *
 * Array of individual results with one object per detected gesture
 * Each result has:
 * - part: part name and number where gesture was detected: face, iris, body, hand
 * - gesture: gesture detected
 */
export type Gesture =
  { 'face': number, gesture: string }
  | { 'iris': number, gesture: string }
  | { 'body': number, gesture: string }
  | { 'hand': number, gesture: string }

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
export interface Person {
  id: number,
  face: Face,
  body: Body | null,
  hands: { left: Hand | null, right: Hand | null },
  gestures: Array<Gesture>,
  box: [number, number, number, number],
  boxRaw?: [number, number, number, number],
}

/**
 * Result interface definition for **Human** library
 *
 * Contains all possible detection results
 */
export interface Result {
  /** {@link Face}: detection & analysis results */
  face: Array<Face>,
  /** {@link Body}: detection & analysis results */
  body: Array<Body>,
  /** {@link Hand}: detection & analysis results */
  hand: Array<Hand>,
  /** {@link Gesture}: detection & analysis results */
  gesture: Array<Gesture>,
  /** {@link Object}: detection & analysis results */
  object: Array<Item>
  /** global performance object with timing values for each operation */
  performance: Record<string, unknown>,
  /** optional processed canvas that can be used to draw input on screen */
  canvas?: OffscreenCanvas | HTMLCanvasElement,
  /** timestamp of detection representing the milliseconds elapsed since the UNIX epoch */
  readonly timestamp: number,
  /** getter property that returns unified persons object  */
  persons: Array<Person>,
}
