import type { FaceResult } from '../result';

export function calculateCameraDistance(face: FaceResult, width: number): number {
  // iris points are [center, left, top, right, bottom]
  // average size of human iris is 11.7mm - fairly constant for all ages/genders/races
  const f = face?.annotations;
  if (!f?.leftEyeIris || !f?.rightEyeIris) return 0;
  // get size of left and right iris in pixels, pick larger one as its likely to be more accurate and normalize to 0..1 range instead of pixels
  const irisSize = Math.max(Math.abs(f.leftEyeIris[3][0] - f.leftEyeIris[1][0]), Math.abs(f.rightEyeIris[3][0] - f.rightEyeIris[1][0])) / width;
  // distance of eye from camera in meters
  const cameraDistance = Math.round(1.17 / irisSize) / 100;
  return cameraDistance;
}

export function calculateEyesDistance(face: FaceResult, width: number): number {
  // average distance between eyes is 65mm - fairly constant for typical adult male, but varies otherwise
  const f = face?.annotations;
  if (!f?.leftEyeIris || !f?.rightEyeIris) return 0;
  // get size of left and right iris in pixels, pick larger one as its likely to be more accurate and normalize to 0..1 range instead of pixels
  const irisSize = Math.max(Math.abs(f.leftEyeIris[3][0] - f.leftEyeIris[1][0]), Math.abs(f.rightEyeIris[3][0] - f.rightEyeIris[1][0])) / width;
  // pixel x and y distance of centers of left and right iris, you can use edges instead
  const irisDistanceXY = [f.leftEyeIris[0][0] - f.rightEyeIris[0][0], f.leftEyeIris[0][1] - f.rightEyeIris[0][1]];
  // absolute distance bewtween eyes in 0..1 range to account for head pitch (we can ignore yaw)
  const irisDistance = Math.sqrt((irisDistanceXY[0] * irisDistanceXY[0]) + (irisDistanceXY[1] * irisDistanceXY[1])) / width;
  // distance between eyes in meters
  const eyesDistance = Math.round(1.17 * irisDistance / irisSize) / 100;
  return eyesDistance;
}
