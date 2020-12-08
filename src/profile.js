import { log } from './log.js';

const profileData = {};

function profile(name, data) {
  if (!data || !data.kernels) return;
  const maxResults = 5;
  const time = data.kernels
    .filter((a) => a.kernelTimeMs > 0)
    .reduce((a, b) => a += b.kernelTimeMs, 0);
  const slowest = data.kernels
    .map((a, i) => { a.id = i; return a; })
    .filter((a) => a.kernelTimeMs > 0)
    .sort((a, b) => b.kernelTimeMs - a.kernelTimeMs);
  const largest = data.kernels
    .map((a, i) => { a.id = i; return a; })
    .filter((a) => a.totalBytesSnapshot > 0)
    .sort((a, b) => b.totalBytesSnapshot - a.totalBytesSnapshot);
  if (slowest.length > maxResults) slowest.length = maxResults;
  if (largest.length > maxResults) largest.length = maxResults;
  const res = { newBytes: data.newBytes, newTensors: data.newTensors, peakBytes: data.peakBytes, numKernelOps: data.kernels.length, timeKernelOps: time, slowestKernelOps: slowest, largestKernelOps: largest };
  profileData[name] = res;
  log('Human profiler', name, res);
}

exports.run = profile;
