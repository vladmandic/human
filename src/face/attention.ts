import type { Tensor } from '../tfjs/types';

export async function augment(rawCoords, results: Tensor[]) {
  const t: Record<string, Float32Array> = {
    eyeL: results[0].dataSync() as Float32Array, // 71 x 2d // output_left_eye
    eyeR: results[6].dataSync() as Float32Array, // 71 x 2d // output_right_eye
    irisL: results[3].dataSync() as Float32Array, // 5 x 2d // output_left_iris
    irisR: results[1].dataSync() as Float32Array, // 5 x 2d // output_right_iris
    lips: results[5].dataSync() as Float32Array, // 80 x 2d // output_lips
    // flag: results[4], // already processed in parent // conv_faceflag
    // mesh: results[2], // already have it in rawCoords // output_mesh_identity
  };
  for (let i = 0; i < t.lips.length / 2; i++) rawCoords.push([t.lips[2 * i + 0], t.lips[2 * i + 1], 0]);
  for (let i = 0; i < t.eyeL.length / 2; i++) rawCoords.push([t.eyeL[2 * i + 0], t.eyeL[2 * i + 1], 0]);
  for (let i = 0; i < t.eyeR.length / 2; i++) rawCoords.push([t.eyeR[2 * i + 0], t.eyeR[2 * i + 1], 0]);
  for (let i = 0; i < t.irisL.length / 2; i++) rawCoords.push([t.irisL[2 * i + 0], t.irisL[2 * i + 1], 0]);
  for (let i = 0; i < t.irisR.length / 2; i++) rawCoords.push([t.irisR[2 * i + 0], t.irisR[2 * i + 1], 0]);
  return rawCoords;
}
