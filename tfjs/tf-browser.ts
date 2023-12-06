/** Creates tfjs bundle used by Human browser build target
 * @external
 */

/* eslint-disable import/no-extraneous-dependencies */

// export * from '@vladmandic/tfjs/dist/tfjs-core.esm.js';
// export * from '@vladmandic/tfjs/dist/tfjs.esm.js';

// export all from build bundle
export * from '@tensorflow/tfjs-core/dist/index.js';
// export * from '@tensorflow/tfjs-data/dist/index.js';
// export * from '@tensorflow/tfjs-layers/dist/index.js';
export * from '@tensorflow/tfjs-converter/dist/index.js';
export * from '@tensorflow/tfjs-backend-cpu/dist/index.js';
export * from '@tensorflow/tfjs-backend-webgl/dist/index.js';
export * from '@tensorflow/tfjs-backend-wasm/dist/index.js';
export * from '@tensorflow/tfjs-backend-webgpu/dist/index.js';

// add tflite to bundle, experimental
// @ts-ignore duplicate definition for setWasmPath
// export * from '@tensorflow/tfjs-tflite/dist/index.js';

// export versions, overrides version object from @tensorflow/tfjs
export { version } from 'dist/tfjs.version.js';
export const node = undefined;
