import { log } from './log';

export const data = {};

export function run(name: string, raw: any): void {
  if (!raw || !raw.kernels) return;
  const maxResults = 5;
  const time = raw.kernels
    .filter((a) => a.kernelTimeMs > 0)
    .reduce((a, b) => a += b.kernelTimeMs, 0);
  const slowest = raw.kernels
    .map((a, i) => { a.id = i; return a; })
    .filter((a) => a.kernelTimeMs > 0)
    .sort((a, b) => b.kernelTimeMs - a.kernelTimeMs);
  const largest = raw.kernels
    .map((a, i) => { a.id = i; return a; })
    .filter((a) => a.totalBytesSnapshot > 0)
    .sort((a, b) => b.totalBytesSnapshot - a.totalBytesSnapshot);
  if (slowest.length > maxResults) slowest.length = maxResults;
  if (largest.length > maxResults) largest.length = maxResults;
  const res = { newBytes: raw.newBytes, newTensors: raw.newTensors, peakBytes: raw.peakBytes, numKernelOps: raw.kernels.length, timeKernelOps: time, slowestKernelOps: slowest, largestKernelOps: largest };
  data[name] = res;
  log('Human profiler', name, res);
}
