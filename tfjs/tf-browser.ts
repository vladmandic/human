/**
 * Creates tfjs bundle used by Human browser build target
 * @external
 */

// get versions of all packages
import { version as tfjsVersion } from '@tensorflow/tfjs/package.json';
import { version as tfjsCoreVersion } from '@tensorflow/tfjs-core/package.json';
import { version as tfjsDataVersion } from '@tensorflow/tfjs-data/package.json';
import { version as tfjsLayersVersion } from '@tensorflow/tfjs-layers/package.json';
import { version as tfjsConverterVersion } from '@tensorflow/tfjs-converter/package.json';
import { version as tfjsBackendCPUVersion } from '@tensorflow/tfjs-backend-cpu/package.json';
import { version as tfjsBackendWebGLVersion } from '@tensorflow/tfjs-backend-webgl/package.json';
import { version as tfjsBackendWASMVersion } from '@tensorflow/tfjs-backend-wasm/package.json';

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

// export all from build
export * from '@tensorflow/tfjs-core/dist/index.js';
export * from '@tensorflow/tfjs-layers/dist/index.js';
export * from '@tensorflow/tfjs-converter/dist/index.js';
export * as data from '@tensorflow/tfjs-data/dist/index.js';
export * from '@tensorflow/tfjs-backend-cpu/dist/index.js';
export * from '@tensorflow/tfjs-backend-webgl/dist/index.js';
export * from '@tensorflow/tfjs-backend-wasm/dist/index.js';
// export * from '@tensorflow/tfjs-backend-webgpu/dist/index.js'; // experimental

// export versions
export const version = {
  tfjs: tfjsVersion,
  'tfjs-core': tfjsCoreVersion,
  'tfjs-data': tfjsDataVersion,
  'tfjs-layers': tfjsLayersVersion,
  'tfjs-converter': tfjsConverterVersion,
  'tfjs-backend-cpu': tfjsBackendCPUVersion,
  'tfjs-backend-webgl': tfjsBackendWebGLVersion,
  'tfjs-backend-wasm': tfjsBackendWASMVersion,
};
