import { log } from './helpers';

export const data = {};

export function run(modelName: string, profileData: any): void { // profileData is tfjs internal type
  if (!profileData || !profileData.kernels) return;
  const maxDetected = 5;
  const time = profileData.kernels
    .filter((a) => a.kernelTimeMs > 0)
    .reduce((a, b) => a += b.kernelTimeMs, 0);
  const slowest = profileData.kernels
    .map((a, i) => { a.id = i; return a; })
    .filter((a) => a.kernelTimeMs > 0)
    .sort((a, b) => b.kernelTimeMs - a.kernelTimeMs);
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
    numKernelOps: profileData.kernels.length,
    timeKernelOps: time,
    slowestKernelOps: slowest,
    largestKernelOps: largest,
  };
  log('profiler', modelName, data[modelName]);
}
