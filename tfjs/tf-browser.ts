/**
 * Creates tfjs bundle used by Human browser build target
 * @external
 */

// export all from sources
// requires treeShaking:ignore-annotations due to tfjs misconfiguration
/*
export * from '@tensorflow/tfjs-core/src/index';
export * from '@tensorflow/tfjs-layers/src/index';
export * from '@tensorflow/tfjs-converter/src/index';
export * as data from '@tensorflow/tfjs-data/src/index';
export * from '@tensorflow/tfjs-backend-cpu/src/index';
export * from '@tensorflow/tfjs-backend-webgl/src/index';
export * from '@tensorflow/tfjs-backend-wasm/src/index';
*/

// export all from build individual packages
/*
export * from '@tensorflow/tfjs-core/dist/index.js';
export * from '@tensorflow/tfjs-layers/dist/index.js';
export * from '@tensorflow/tfjs-converter/dist/index.js';
export * as data from '@tensorflow/tfjs-data/dist/index.js';
export * from '@tensorflow/tfjs-backend-cpu/dist/index.js';
export * from '@tensorflow/tfjs-backend-webgl/dist/index.js';
export * from '@tensorflow/tfjs-backend-wasm/dist/index.js';
*/

// export all from build bundle
export * from '@tensorflow/tfjs/dist/index.js';
export * from '@tensorflow/tfjs-backend-webgl/dist/index.js';
export * from '@tensorflow/tfjs-backend-wasm/dist/index.js';

// add webgpu to bundle, experimental
// export * from '@tensorflow/tfjs-backend-webgpu/dist/index.js';

// export versions, overrides version object from @tensorflow/tfjs
export { version } from '../dist/tfjs.version.js';
