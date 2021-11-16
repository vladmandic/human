/**
 * BlazeFace, FaceMesh & Iris model implementation
 *
 * Based on:
 * - [**MediaPipe BlazeFace**](https://drive.google.com/file/d/1f39lSzU5Oq-j_OXgS67KfN5wNsoeAZ4V/view)
 * - Facial Spacial Geometry: [**MediaPipe FaceMesh**](https://drive.google.com/file/d/1VFC_wIpw4O7xBOiTgUldl79d9LA-LsnA/view)
 * - Eye Iris Details: [**MediaPipe Iris**](https://drive.google.com/file/d/1bsWbokp9AklH2ANjCfmjqEzzxO1CNbMu/view)
 */

import { log, join, now } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import * as blazeface from './blazeface';
import * as util from './facemeshutil';
import * as coords from './facemeshcoords';
import * as iris from './iris';
import { histogramEqualization } from '../image/enhance';
import { env } from '../util/env';
import type { GraphModel, Tensor } from '../tfjs/types';
import type { FaceResult, Point } from '../result';
import type { Config } from '../config';

type BoxCache = { startPoint: Point, endPoint: Point, landmarks: Array<Point>, confidence: number };
let boxCache: Array<BoxCache> = [];
let model: GraphModel | null = null;
let inputSize = 0;
let skipped = Number.MAX_SAFE_INTEGER;
let lastTime = 0;

export async function predict(input: Tensor, config: Config): Promise<FaceResult[]> {
  // reset cached boxes
  const skipTime = (config.face.detector?.skipTime || 0) > (now() - lastTime);
  const skipFrame = skipped < (config.face.detector?.skipFrames || 0);
  if (!config.skipAllowed || !skipTime || !skipFrame || boxCache.length === 0) {
    const possibleBoxes = await blazeface.getBoxes(input, config); // get results from blazeface detector
    lastTime = now();
    boxCache = []; // empty cache
    for (const possible of possibleBoxes.boxes) { // extract data from detector
      const box: BoxCache = {
        startPoint: possible.box.startPoint,
        endPoint: possible.box.endPoint,
        landmarks: possible.landmarks,
        confidence: possible.confidence,
      };
      const boxScaled = util.scaleBoxCoordinates(box, possibleBoxes.scaleFactor);
      const boxEnlarged = util.enlargeBox(boxScaled, Math.sqrt(config.face.detector?.cropFactor || 1.6));
      const boxSquared = util.squarifyBox(boxEnlarged);
      boxCache.push(boxSquared);
    }
    skipped = 0;
  } else {
    skipped++;
  }
  const faces: Array<FaceResult> = [];
  const newCache: Array<BoxCache> = [];
  let id = 0;
  for (let i = 0; i < boxCache.length; i++) {
    let box = boxCache[i];
    let angle = 0;
    let rotationMatrix;
    const face: FaceResult = { // init face result
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

    // optional rotation correction based on detector data only if mesh is disabled otherwise perform it later when we have more accurate mesh data. if no rotation correction this function performs crop
    [angle, rotationMatrix, face.tensor] = util.correctFaceRotation(config.face.detector?.rotation, box, input, config.face.mesh?.enabled ? inputSize : blazeface.size());
    if (config?.filter?.equalization) {
      const equilized = await histogramEqualization(face.tensor as Tensor);
      tf.dispose(face.tensor);
      face.tensor = equilized;
    }
    face.boxScore = Math.round(100 * box.confidence) / 100;
    if (!config.face.mesh?.enabled) { // mesh not enabled, return resuts from detector only
      face.box = util.getClampedBox(box, input);
      face.boxRaw = util.getRawBox(box, input);
      face.score = face.boxScore;
      face.mesh = box.landmarks.map((pt) => [
        ((box.startPoint[0] + box.endPoint[0])) / 2 + ((box.endPoint[0] + box.startPoint[0]) * pt[0] / blazeface.size()),
        ((box.startPoint[1] + box.endPoint[1])) / 2 + ((box.endPoint[1] + box.startPoint[1]) * pt[1] / blazeface.size()),
      ]);
      face.meshRaw = face.mesh.map((pt) => [pt[0] / (input.shape[2] || 0), pt[1] / (input.shape[1] || 0), (pt[2] || 0) / inputSize]);
      for (const key of Object.keys(coords.blazeFaceLandmarks)) face.annotations[key] = [face.mesh[coords.blazeFaceLandmarks[key] as number]]; // add annotations
    } else if (!model) { // mesh enabled, but not loaded
      if (config.debug) log('face mesh detection requested, but model is not loaded');
    } else { // mesh enabled
      const [contours, confidence, contourCoords] = model.execute(face.tensor as Tensor) as Array<Tensor>; // first returned tensor represents facial contours which are already included in the coordinates.
      const faceConfidence = await confidence.data();
      face.faceScore = Math.round(100 * faceConfidence[0]) / 100;
      const coordsReshaped = tf.reshape(contourCoords, [-1, 3]);
      let rawCoords = await coordsReshaped.array();
      tf.dispose([contourCoords, coordsReshaped, confidence, contours]);
      if (face.faceScore < (config.face.detector?.minConfidence || 1)) { // low confidence in detected mesh
        box.confidence = face.faceScore; // reset confidence of cached box
      } else {
        if (config.face.iris?.enabled) rawCoords = await iris.augmentIris(rawCoords, face.tensor, config, inputSize); // augment results with iris
        face.mesh = util.transformRawCoords(rawCoords, box, angle, rotationMatrix, inputSize); // get processed mesh
        face.meshRaw = face.mesh.map((pt) => [pt[0] / (input.shape[2] || 0), pt[1] / (input.shape[1] || 0), (pt[2] || 0) / inputSize]);
        for (const key of Object.keys(coords.meshAnnotations)) face.annotations[key] = coords.meshAnnotations[key].map((index) => face.mesh[index]); // add annotations
        box = util.squarifyBox({ ...util.enlargeBox(util.calculateLandmarksBoundingBox(face.mesh), (config.face.detector?.cropFactor || 1.6)), confidence: box.confidence }); // redefine box with mesh calculated one
        face.box = util.getClampedBox(box, input); // update detected box with box around the face mesh
        face.boxRaw = util.getRawBox(box, input);
        face.score = face.faceScore;
        newCache.push(box);
        tf.dispose(face.tensor);
        [angle, rotationMatrix, face.tensor] = util.correctFaceRotation(config.face.detector?.rotation, box, input, inputSize); // optional rotate once more based on mesh data
      }
    }
    faces.push(face);
  }
  boxCache = [...newCache]; // reset cache
  return faces;
}

export async function load(config: Config): Promise<GraphModel> {
  if (env.initial) model = null;
  if (!model) {
    model = await tf.loadGraphModel(join(config.modelBasePath, config.face.mesh?.modelPath || '')) as unknown as GraphModel;
    if (!model || !model['modelUrl']) log('load model failed:', config.face.mesh?.modelPath);
    else if (config.debug) log('load model:', model['modelUrl']);
  } else if (config.debug) log('cached model:', model['modelUrl']);
  inputSize = model.inputs[0].shape ? model.inputs[0].shape[2] : 0;
  return model;
}

export const triangulation = coords.TRI468;
export const uvmap = coords.UV468;
