/**
 * BlazeFace, FaceMesh & Iris model implementation
 *
 * Based on:
 * - [**MediaPipe BlazeFace**](https://drive.google.com/file/d/1f39lSzU5Oq-j_OXgS67KfN5wNsoeAZ4V/view)
 * - Facial Spacial Geometry: [**MediaPipe FaceMesh**](https://drive.google.com/file/d/1VFC_wIpw4O7xBOiTgUldl79d9LA-LsnA/view)
 * - Eye Iris Details: [**MediaPipe Iris**](https://drive.google.com/file/d/1bsWbokp9AklH2ANjCfmjqEzzxO1CNbMu/view)
 */

import { log, join } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import * as blazeface from './blazeface';
import * as util from './facemeshutil';
import * as coords from './facemeshcoords';
import * as iris from './iris';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { FaceResult, Point } from '../result';
import type { Config } from '../config';
import { env } from '../util/env';

type BoxCache = { startPoint: Point, endPoint: Point, landmarks: Array<Point>, confidence: number, faceConfidence?: number | undefined };
let boxCache: Array<BoxCache> = [];
let model: GraphModel | null = null;
let inputSize = 0;
let skipped = Number.MAX_SAFE_INTEGER;
let detectedFaces = 0;

export async function predict(input: Tensor, config: Config): Promise<FaceResult[]> {
  if (!config.skipFrame || (((detectedFaces !== config.face.detector?.maxDetected) || !config.face.mesh?.enabled)) && (skipped > (config.face.detector?.skipFrames || 0))) { // reset cached boxes
    const newBoxes = await blazeface.getBoxes(input, config); // get results from blazeface detector
    boxCache = []; // empty cache
    for (const possible of newBoxes.boxes) { // extract data from detector
      const startPoint = await possible.box.startPoint.data() as unknown as Point;
      const endPoint = await possible.box.endPoint.data() as unknown as Point;
      const landmarks = await possible.landmarks.array() as Array<Point>;
      boxCache.push({ startPoint, endPoint, landmarks, confidence: possible.confidence });
    }
    newBoxes.boxes.forEach((prediction) => tf.dispose([prediction.box.startPoint, prediction.box.endPoint, prediction.landmarks]));
    for (let i = 0; i < boxCache.length; i++) { // enlarge and squarify detected boxes
      const scaledBox = util.scaleBoxCoordinates({ startPoint: boxCache[i].startPoint, endPoint: boxCache[i].endPoint }, newBoxes.scaleFactor);
      const enlargedBox = util.enlargeBox(scaledBox);
      const squarifiedBox = util.squarifyBox(enlargedBox);
      boxCache[i] = { ...squarifiedBox, confidence: boxCache[i].confidence, landmarks: boxCache[i].landmarks };
    }
    skipped = 0;
  } else {
    skipped++;
  }

  const faces: Array<FaceResult> = [];
  const newBoxes: Array<BoxCache> = [];
  let id = 0;
  for (let box of boxCache) {
    let angle = 0;
    let rotationMatrix;
    const face: FaceResult = {
      id: id++,
      mesh: [],
      meshRaw: [],
      box: [0, 0, 0, 0],
      boxRaw: [0, 0, 0, 0],
      score: 0,
      boxScore: 0,
      faceScore: 0,
      annotations: {},
    };

    if (config.face.detector?.rotation && config.face.mesh?.enabled && env.kernels.includes('rotatewithoffset')) {
      [angle, rotationMatrix, face.tensor] = util.correctFaceRotation(box, input, inputSize);
    } else {
      rotationMatrix = util.IDENTITY_MATRIX;
      const cut = util.cutBoxFromImageAndResize({ startPoint: box.startPoint, endPoint: box.endPoint }, input, config.face.mesh?.enabled ? [inputSize, inputSize] : [blazeface.size(), blazeface.size()]);
      face.tensor = tf.div(cut, 255);
      tf.dispose(cut);
    }
    face.boxScore = Math.round(100 * box.confidence) / 100;
    if (!config.face.mesh?.enabled) { // mesh not enabled, return resuts from detector only
      face.box = util.getClampedBox(box, input);
      face.boxRaw = util.getRawBox(box, input);
      face.score = Math.round(100 * box.confidence || 0) / 100;
      face.mesh = box.landmarks.map((pt) => [
        ((box.startPoint[0] + box.endPoint[0])) / 2 + ((box.endPoint[0] + box.startPoint[0]) * pt[0] / blazeface.size()),
        ((box.startPoint[1] + box.endPoint[1])) / 2 + ((box.endPoint[1] + box.startPoint[1]) * pt[1] / blazeface.size()),
      ]);
      face.meshRaw = face.mesh.map((pt) => [pt[0] / (input.shape[2] || 0), pt[1] / (input.shape[1] || 0), (pt[2] || 0) / inputSize]);
      for (const key of Object.keys(coords.blazeFaceLandmarks)) face.annotations[key] = [face.mesh[coords.blazeFaceLandmarks[key]]]; // add annotations
    } else if (!model) { // mesh enabled, but not loaded
      if (config.debug) log('face mesh detection requested, but model is not loaded');
    } else { // mesh enabled
      const [contours, confidence, contourCoords] = model.execute(face.tensor as Tensor) as Array<Tensor>; // first returned tensor represents facial contours which are already included in the coordinates.
      tf.dispose(contours);
      const faceConfidence = (await confidence.data())[0] as number;
      tf.dispose(confidence);
      const coordsReshaped = tf.reshape(contourCoords, [-1, 3]);
      let rawCoords = await coordsReshaped.array();
      tf.dispose(contourCoords);
      tf.dispose(coordsReshaped);
      if (faceConfidence < (config.face.detector?.minConfidence || 1)) {
        box.confidence = faceConfidence; // reset confidence of cached box
        tf.dispose(face.tensor);
      } else {
        if (config.face.iris?.enabled) rawCoords = await iris.augmentIris(rawCoords, face.tensor, config, inputSize); // augment results with iris
        face.mesh = util.transformRawCoords(rawCoords, box, angle, rotationMatrix, inputSize); // get processed mesh
        face.meshRaw = face.mesh.map((pt) => [pt[0] / (input.shape[2] || 0), pt[1] / (input.shape[1] || 0), (pt[2] || 0) / inputSize]);
        box = { ...util.enlargeBox(util.calculateLandmarksBoundingBox(face.mesh), 1.5), confidence: box.confidence }; // redefine box with mesh calculated one
        for (const key of Object.keys(coords.meshAnnotations)) face.annotations[key] = coords.meshAnnotations[key].map((index) => face.mesh[index]); // add annotations
        if (config.face.detector?.rotation && config.face.mesh.enabled && config.face.description?.enabled && env.kernels.includes('rotatewithoffset')) { // do rotation one more time with mesh keypoints if we want to return perfect image
          tf.dispose(face.tensor); // dispose so we can overwrite original face
          [angle, rotationMatrix, face.tensor] = util.correctFaceRotation(box, input, inputSize);
        }
        face.box = util.getClampedBox(box, input); // update detected box with box around the face mesh
        face.boxRaw = util.getRawBox(box, input);
        face.score = Math.round(100 * faceConfidence || 100 * box.confidence || 0) / 100;
        face.faceScore = Math.round(100 * faceConfidence) / 100;
        box = { ...util.squarifyBox(box), confidence: box.confidence, faceConfidence }; // updated stored cache values
      }
    }
    faces.push(face);
    newBoxes.push(box);
  }
  if (config.face.mesh?.enabled) boxCache = newBoxes.filter((a) => a.confidence > (config.face.detector?.minConfidence || 0)); // remove cache entries for detected boxes on low confidence
  detectedFaces = faces.length;
  return faces;
}

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.mesh?.modelPath || '')) as unknown as GraphModel;
    if (!model || !model['modelUrl']) log('load model failed:', config.body.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  inputSize = model.inputs[0].shape ? model.inputs[0].shape[2] : 0;
  if (inputSize === -1) inputSize = 64;
  return model;
}

export const triangulation = coords.TRI468;
export const uvmap = coords.UV468;
