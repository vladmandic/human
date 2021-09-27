import type { Box } from '../result';

// helper function: find box around keypoints, square it and scale it
export function scale(keypoints, boxScaleFact, outputSize) {
  const coords = [keypoints.map((pt) => pt[0]), keypoints.map((pt) => pt[1])]; // all x/y coords
  const maxmin = [Math.max(...coords[0]), Math.min(...coords[0]), Math.max(...coords[1]), Math.min(...coords[1])]; // find min/max x/y coordinates
  const center = [(maxmin[0] + maxmin[1]) / 2, (maxmin[2] + maxmin[3]) / 2]; // find center x and y coord of all fingers
  const diff = Math.max(center[0] - maxmin[1], center[1] - maxmin[3], -center[0] + maxmin[0], -center[1] + maxmin[2]) * boxScaleFact; // largest distance from center in any direction
  const box = [
    Math.trunc(center[0] - diff),
    Math.trunc(center[1] - diff),
    Math.trunc(2 * diff),
    Math.trunc(2 * diff),
  ] as Box;
  const boxRaw = [ // work backwards
    box[0] / outputSize[0],
    box[1] / outputSize[1],
    box[2] / outputSize[0],
    box[3] / outputSize[1],
  ] as Box;
  const yxBox = [ // work backwards
    boxRaw[1],
    boxRaw[0],
    boxRaw[3] + boxRaw[1],
    boxRaw[2] + boxRaw[0],
  ] as Box;
  return { box, boxRaw, yxBox };
}
