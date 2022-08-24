/**
 * Profiling calculations
 * Debug only
 */

import { log } from './util';

export const data = {};

export interface ProfileData {
  newBytes: number,
  peakBytes: number,
  newTensors: number,
  kernels: {
    id: number,
    kernelTimeMs: number,
    totalBytesSnapshot: number,
  }[],
}

export function run(modelName: string, profileData: ProfileData): void { // profileData is tfjs internal type
  if (!profileData?.kernels) return;
  const maxDetected = 5;
  const time = (profileData.kernels)
    .filter((a) => a.kernelTimeMs > 0)
    .reduce((a, b) => a += b.kernelTimeMs, 0);
  const slowest = (profileData.kernels)
    .map((a, i) => { a.id = i; return a; })
    .filter((a) => a.kernelTimeMs > 0)
    .sort((a, b) => b.kernelTimeMs - a.kernelTimeMs);
  const largest = (profileData.kernels)
    .map((a, i) => { a.id = i; return a; })
    .filter((a) => a.totalBytesSnapshot > 0)
    .sort((a, b) => b.totalBytesSnapshot - a.totalBytesSnapshot);
  if (slowest.length > maxDetected) slowest.length = maxDetected;
  if (largest.length > maxDetected) largest.length = maxDetected;
  data[modelName] = {
    model: modelName,
    newBytes: profileData.newBytes,
    newTensors: profileData.newTensors,
    peakBytes: profileData.peakBytes,
    numKernelOps: (profileData.kernels).length,
    timeKernelOps: time,
    slowestKernelOps: slowest,
    largestKernelOps: largest,
  };
  log('profiler', modelName, data[modelName]);
}
