/**
 * Result interface definition for **Human** library
 *
 * Contains all possible detection results
 */
export interface Result {
  /** Face results
   * Combined results of face detector, face mesh, age, gender, emotion, embedding, iris models
   * Some values may be null if specific model is not enabled
   *
   * Array of individual results with one object per detected face
   * Each result has:
   * - overal detection confidence value
   * - box detection confidence value
   * - mesh detection confidence value
   * - box as array of [x, y, width, height], normalized to image resolution
   * - boxRaw as array of [x, y, width, height], normalized to range 0..1
   * - mesh as array of [x, y, z] points of face mesh, normalized to image resolution
   * - meshRaw as array of [x, y, z] points of face mesh, normalized to range 0..1
   * - annotations as array of annotated face mesh points
   * - age as value
   * - gender as value
   * - genderConfidence as value
   * - emotion as array of possible emotions with their individual scores
   * - iris as distance value
   * - angle as object with values for roll, yaw and pitch angles
   */
  face: Array<{
    confidence: Number,
    boxConfidence: Number,
    faceConfidence: Number,
    box: [Number, Number, Number, Number],
    boxRaw: [Number, Number, Number, Number],
    mesh: Array<[Number, Number, Number]>
    meshRaw: Array<[Number, Number, Number]>
    annotations: Array<{ part: String, points: Array<[Number, Number, Number]>[] }>,
    age: Number,
    gender: String,
    genderConfidence: Number,
    emotion: Array<{ score: Number, emotion: String }>,
    embedding: Array<Number>,
    iris: Number,
    angle: { roll: Number, yaw: Number, pitch: Number },
  }>,
  /** Body results
   *
   * Array of individual results with one object per detected body
   * Each results has:
   * - body id number
   * - body part name
   * - part position with x,y,z coordinates
   * - body part score value
   * - body part presence value
   */
  body: Array<{
    id: Number,
    part: String,
    position: { x: Number, y: Number, z: Number },
    score: Number,
    presence: Number }>,
  /** Hand results
   *
   * Array of individual results with one object per detected hand
   * Each result has:
   * - confidence as value
   * - box as array of [x, y, width, height], normalized to image resolution
   * - boxRaw as array of [x, y, width, height], normalized to range 0..1
   * - landmarks as array of [x, y, z] points of hand, normalized to image resolution
   * - annotations as array of annotated face landmark points
   */
  hand: Array<{
    confidence: Number,
    box: [Number, Number, Number, Number],
    boxRaw: [Number, Number, Number, Number],
    landmarks: Array<[Number, Number, Number]>,
    annotations: Array<{ part: String, points: Array<[Number, Number, Number]>[] }>,
  }>,
  /** Gesture results
   *
   * Array of individual results with one object per detected gesture
   * Each result has:
   * - part where gesture was detected
   * - gesture detected
   */
  gesture: Array<{
    part: String,
    gesture: String,
  }>,
  /** Object results
  *
  * Array of individual results with one object per detected gesture
  * Each result has:
  * - score as value
  * - label as detected class name
  * - center as array of [x, y], normalized to image resolution
  * - centerRaw as array of [x, y], normalized to range 0..1
  * - box as array of [x, y, width, height], normalized to image resolution
  * - boxRaw as array of [x, y, width, height], normalized to range 0..1
  */
 object: Array<{
    score: Number,
    strideSize: Number,
    class: Number,
    label: String,
    center: Number[],
    centerRaw: Number[],
    box: Number[],
    boxRaw: Number[],
  }>,
  performance: { any },
  canvas: OffscreenCanvas | HTMLCanvasElement,
}
