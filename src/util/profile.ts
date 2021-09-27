/**
 * Profiling calculations
 * Debug only
 */

import { log } from './util';

export const data = {};

export function run(modelName: string, profileData: Record<string, unknown>): void { // profileData is tfjs internal type
  if (!profileData || !profileData.kernels) return;
  const maxDetected = 5;
  // @ts-ignore profileData.kernels is tfjs internal type
  const time = profileData.kernels
    .filter((a) => a.kernelTimeMs > 0)
    .reduce((a, b) => a += b.kernelTimeMs, 0);
  // @ts-ignore profileData.kernels is tfjs internal type
  const slowest = profileData.kernels
    .map((a, i) => { a.id = i; return a; })
    .filter((a) => a.kernelTimeMs > 0)
    .sort((a, b) => b.kernelTimeMs - a.kernelTimeMs);
  // @ts-ignore profileData.kernels is tfjs internal type
  const largest = profileData.kernels
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
    numKernelOps: (profileData['kernels'] as Array<unknown>).length,
    timeKernelOps: time,
    slowestKernelOps: slowest,
    largestKernelOps: largest,
  };
  log('profiler', modelName, data[modelName]);
}
