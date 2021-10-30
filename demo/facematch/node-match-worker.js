const threads = require('worker_threads');

let debug = false;

/** @type SharedArrayBuffer */
let buffer;
/** @type Float32Array */
let view;
let threshold = 0;
let records = 0;

const descLength = 1024; // descriptor length in bytes

function distance(descBuffer, index, options = { order: 2, multiplier: 20 }) {
  const descriptor = new Float32Array(descBuffer);
  let sum = 0;
  for (let i = 0; i < descriptor.length; i++) {
    const diff = (options.order === 2) ? (descriptor[i] - view[index * descLength + i]) : (Math.abs(descriptor[i] - view[index * descLength + i]));
    sum += (options.order === 2) ? (diff * diff) : (diff ** options.order);
  }
  return (options.multiplier || 20) * sum;
}

function match(descBuffer, options = { order: 2, multiplier: 20 }) {
  let best = Number.MAX_SAFE_INTEGER;
  let index = -1;
  for (let i = 0; i < records; i++) {
    const res = distance(descBuffer, i, { order: options.order, multiplier: options.multiplier });
    if (res < best) {
      best = res;
      index = i;
    }
    if (best < threshold || best === 0) break; // short circuit
  }
  best = (options.order === 2) ? Math.sqrt(best) : best ** (1 / options.order);
  return { index, distance: best, similarity: Math.max(0, 100 - best) / 100.0 };
}

threads.parentPort?.on('message', (msg) => {
  if (typeof msg.descriptor !== 'undefined') { // actual work order to find a match
    const t0 = performance.now();
    const result = match(msg.descriptor);
    const t1 = performance.now();
    threads.parentPort?.postMessage({ request: msg.request, time: Math.trunc(t1 - t0), ...result });
    return; // short circuit
  }
  if (msg instanceof SharedArrayBuffer) { // called only once to receive reference to shared array buffer
    buffer = msg;
    view = new Float32Array(buffer); // initialize f64 view into buffer
    if (debug) threads.parentPort?.postMessage(`buffer: ${buffer?.byteLength}`);
  }
  if (typeof msg.records !== 'undefined') { // recived every time when number of records changes
    records = msg.records;
    if (debug) threads.parentPort?.postMessage(`records: ${records}`);
  }
  if (typeof msg.debug !== 'undefined') { // set verbose logging
    debug = msg.debug;
    if (debug) threads.parentPort?.postMessage(`debug: ${debug}`);
  }
  if (typeof msg.threshold !== 'undefined') { // set minimum similarity threshold
    threshold = msg.threshold;
    if (debug) threads.parentPort?.postMessage(`threshold: ${threshold}`);
  }
  if (typeof msg.shutdown !== 'undefined') { // got message to close worker
    if (debug) threads.parentPort?.postMessage('shutting down');
    process.exit(0);
  }
});

if (debug) threads.parentPort?.postMessage('started');
