import * as constants from './constants';
import type { Tensor } from '../tfjs/types';

export async function augment(rawCoords, results: Tensor[]) {
  const t: Record<string, Float32Array> = { // all attention models produce 2d results so it needs to be later augmented with correct z-coords
    // mesh: results[0], // already have it in rawCoords // output_mesh_identity
    // flag: results[1], // already processed in parent // conv_faceflag
    lips: await results.filter((r) => r.size === 160)?.[0]?.data() as Float32Array, // 80 x 2d = 160 // output_lips
    irisL: await results.filter((r) => r.size === 10)?.[0]?.data() as Float32Array, // 5 x 2d = 10 // output_right_iris
    eyeL: await results.filter((r) => r.size === 142)?.[0]?.data() as Float32Array, // 71 x 2d = 142 // output_right_eye
    irisR: await results.filter((r) => r.size === 10)?.[1]?.data() as Float32Array, // 5 x 2d = 10 // output_left_iris
    eyeR: await results.filter((r) => r.size === 142)?.[1]?.data() as Float32Array, // 71 x 2d = 142// output_left_eye
  };
  for (const val of Object.values(t)) {
    if (!val) return rawCoords; // could not find tensor
  }

  // augment iris: adds additional 5 keypoints per eye
  const irisLDepth = constants.LANDMARKS_REFINEMENT_LEFT_EYE_CONFIG.reduce((prev, curr) => prev += rawCoords[curr][2], 0) / constants.LANDMARKS_REFINEMENT_LEFT_EYE_CONFIG.length; // get average z-coord for iris
  for (let i = 0; i < t.irisL.length / 2; i++) rawCoords.push([t.irisL[2 * i + 0], t.irisL[2 * i + 1], irisLDepth]);
  const irisRDepth = constants.LANDMARKS_REFINEMENT_RIGHT_EYE_CONFIG.reduce((prev, curr) => prev += rawCoords[curr][2], 0) / constants.LANDMARKS_REFINEMENT_RIGHT_EYE_CONFIG.length; // get average z-coord for iris
  for (let i = 0; i < t.irisR.length / 2; i++) rawCoords.push([t.irisR[2 * i + 0], t.irisR[2 * i + 1], irisRDepth]);

  // augment eyes: replaces eye keypoints based on heuristic mapping
  for (let i = 0; i < t.eyeL.length / 2; i++) rawCoords[constants.LANDMARKS_REFINEMENT_LEFT_EYE_CONFIG[i]] = [t.eyeL[2 * i + 0], t.eyeL[2 * i + 1], rawCoords[constants.LANDMARKS_REFINEMENT_LEFT_EYE_CONFIG[i]][2]];
  for (let i = 0; i < t.eyeR.length / 2; i++) rawCoords[constants.LANDMARKS_REFINEMENT_RIGHT_EYE_CONFIG[i]] = [t.eyeR[2 * i + 0], t.eyeR[2 * i + 1], rawCoords[constants.LANDMARKS_REFINEMENT_RIGHT_EYE_CONFIG[i]][2]];

  // augment lips: replaces eye keypoints based on heuristic mapping
  for (let i = 0; i < t.lips.length / 2; i++) rawCoords[constants.LANDMARKS_REFINEMENT_LIPS_CONFIG[i]] = [t.lips[2 * i + 0], t.lips[2 * i + 1], rawCoords[constants.LANDMARKS_REFINEMENT_LIPS_CONFIG[i]][2]];

  return rawCoords;
}
