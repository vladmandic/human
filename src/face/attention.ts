import type { Tensor } from '../tfjs/types';

const attentionDefinitions = {
  eyeLLower: [33, 7, 163, 144, 145, 153, 154, 155, 133], // 9
  eyeRLower: [263, 249, 390, 373, 374, 380, 381, 382, 362], // 9
  // eslint-disable-next-line max-len
  lips: [61, 76, 91, 181, 84, 17, 314, 405, 321, 291, 291, 185, 40, 39, 37, 0, 267, 269, 270, 291, 62, 183, 88, 178, 87, 14, 268, 303, 304, 408, 291, 184, 42, 178, 87, 14, 268, 303, 304, 408, 61, 62, 90, 180, 85, 16, 315, 404, 307, 308, 291, 185, 40, 73, 72, 0, 302, 269, 270, 409, 61, 184, 95, 179, 86, 15, 316, 403, 324, 408, 291, 184, 74, 41, 38, 11, 268, 303, 304, 408],
  // eslint-disable-next-line max-len
  eyeL: [33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 161, 160, 159, 158, 157, 173, 130, 25, 110, 24, 23, 22, 26, 112, 243, 247, 30, 29, 27, 28, 56, 190, 226, 31, 228, 229, 230, 231, 232, 233, 244, 113, 225, 224, 223, 222, 221, 189, 35, 124, 46, 53, 52, 65, 143, 111, 117, 118, 119, 120, 121, 128, 245, 156, 70, 63, 105, 66, 107, 55, 193],
  // eslint-disable-next-line max-len
  eyeR: [263, 249, 390, 373, 374, 380, 381, 382, 362, 466, 388, 387, 386, 385, 384, 398, 359, 255, 339, 254, 253, 252, 256, 341, 463, 467, 260, 259, 257, 258, 286, 414, 446, 261, 448, 449, 450, 451, 452, 453, 464, 342, 445, 444, 443, 442, 441, 413, 265, 353, 276, 283, 282, 295, 372, 340, 346, 347, 348, 349, 350, 357, 465, 383, 300, 293, 334, 296, 336, 285, 417],
};

/*
// function used to determine heuristic mapping
// values in attentionDefinitions are based on top values from 200 iterations
function replaceClosestPoint(rawCoords, newCoords) {
  const res: number[] = [];
  for (let i = 0; i < newCoords.length / 2; i++) {
    let minDist = Number.MAX_VALUE;
    let minDistIdx = -1;
    const pts = rawCoords.map((r) => [r[0], r[1]]);
    for (let j = 0; j < rawCoords.length; j++) {
      const x = pts[j][0] - newCoords[2 * i + 0];
      const y = pts[j][1] - newCoords[2 * i + 1];
      const dist = (x * x) + (y * y);
      if (dist < minDist) {
        minDist = dist;
        minDistIdx = j;
      }
    }
    res.push(minDistIdx);
    rawCoords[minDistIdx] = [newCoords[2 * i + 0], newCoords[2 * i + 1], rawCoords[minDistIdx][2]];
  }
  return rawCoords;
}
*/

export async function augment(rawCoords, results: Tensor[]) {
  const t: Record<string, Float32Array> = { // all attention models produce 2d results so it needs to be later augmented with correct z-coords
    irisL: results[3].dataSync() as Float32Array, // 5 x 2d // output_left_iris
    irisR: results[1].dataSync() as Float32Array, // 5 x 2d // output_right_iris
    eyeL: results[0].dataSync() as Float32Array, // 71 x 2d // output_left_eye
    eyeR: results[6].dataSync() as Float32Array, // 71 x 2d // output_right_eye
    lips: results[5].dataSync() as Float32Array, // 80 x 2d // output_lips
    // flag: results[4], // already processed in parent // conv_faceflag
    // mesh: results[2], // already have it in rawCoords // output_mesh_identity
  };

  // rawCoords = replaceClosestPoint(rawCoords, t.eyeL);
  // rawCoords = replaceClosestPoint(rawCoords, t.eyeR);
  // rawCoords = replaceClosestPoint(rawCoords, t.lips);

  // augment iris: adds additional 5 keypoints per eye
  const irisRDepth = attentionDefinitions.eyeRLower.reduce((prev, curr) => prev += rawCoords[curr][2], 0) / attentionDefinitions.eyeRLower.length; // get average z-coord for iris
  for (let i = 0; i < t.irisR.length / 2; i++) rawCoords.push([t.irisR[2 * i + 0], t.irisR[2 * i + 1], irisRDepth]);
  const irisLDepth = attentionDefinitions.eyeLLower.reduce((prev, curr) => prev += rawCoords[curr][2], 0) / attentionDefinitions.eyeLLower.length; // get average z-coord for iris
  for (let i = 0; i < t.irisL.length / 2; i++) rawCoords.push([t.irisL[2 * i + 0], t.irisL[2 * i + 1], irisLDepth]);

  // augment eyes: replaces eye keypoints based on heuristic mapping
  for (let i = 0; i < t.eyeL.length / 2; i++) rawCoords[attentionDefinitions.eyeL[i]] = [t.eyeL[2 * i + 0], t.eyeL[2 * i + 1], rawCoords[attentionDefinitions.eyeL[i]][2]];
  // for (let i = 0; i < t.eyeL.length / 2; i++) rawCoords.push([t.eyeL[2 * i + 0], t.eyeL[2 * i + 1], 0]);
  for (let i = 0; i < t.eyeR.length / 2; i++) rawCoords[attentionDefinitions.eyeR[i]] = [t.eyeR[2 * i + 0], t.eyeR[2 * i + 1], rawCoords[attentionDefinitions.eyeR[i]][2]];
  // for (let i = 0; i < t.eyeR.length / 2; i++) rawCoords.push([t.eyeR[2 * i + 0], t.eyeR[2 * i + 1], 0]);

  // augment lips: replaces eye keypoints based on heuristic mapping
  // for (let i = 0; i < t.lips.length / 2; i++) rawCoords[attentionDefinitions.lips[i]] = [t.lips[2 * i + 0], t.lips[2 * i + 1], rawCoords[attentionDefinitions.lips[i]][2]];
  // for (let i = 0; i < t.lips.length / 2; i++) rawCoords.push([t.lips[2 * i + 0], t.lips[2 * i + 1], 0]);

  return rawCoords;
}
