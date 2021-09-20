const fs = require('fs');
const tf = require('@tensorflow/tfjs');
const wasm = require('@tensorflow/tfjs-backend-wasm');

async function main() {
  wasm.setWasmPaths('node_modules/@tensorflow/tfjs-backend-wasm/dist/');
  await tf.setBackend('wasm');
  await tf.ready();
  console.log('tfjs:', { version: tf.version_core, backend: tf.getBackend() });
  const t = {};
  const data = fs.readFileSync('dist/tfjs.esm.js.map');
  for (let i = 0; i <= 22; i++) {
    const arr = Array.from(data);
    const size = 2 ** i;
    arr.length = size;
    t.i32 = tf.tensor(arr, [size], 'int32');
    t.f32 = tf.tensor(arr, [size], 'float32');
    t.sumI = tf.sum(t.i32);
    t.sumF = tf.sum(t.f32);
    const JS = arr.reduce((prev, curr) => prev += curr, 0);
    const I32 = t.sumI.dataSync()[0];
    const F32 = t.sumF.dataSync()[0];
    console.log({ size, JS, I32, F32, ok: JS === I32 });
    Object.keys(t).forEach((tensor) => tf.dispose(tensor));
  }
}

main();
