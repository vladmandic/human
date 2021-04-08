// wrapper to load tfjs in a single place so version can be changed quickly

// simplified
// { modules: 1250, moduleBytes: 4013323, imports: 7, importBytes: 2255, outputBytes: 2991826, outputFiles: 'dist/tfjs.esm.js' }
// export * from '@tensorflow/tfjs/dist/index.js';
// export * from '@tensorflow/tfjs-backend-wasm';

// modular
// { modules: 1253, moduleBytes: 4029357, imports: 7, importBytes: 2285, outputBytes: 2998298, outputFiles: 'dist/tfjs.esm.js' }

// get versions of all packages.
import * as packageBundle from '@tensorflow/tfjs/package.json';
import * as packageCore from '@tensorflow/tfjs-core/package.json';
import * as packageData from '@tensorflow/tfjs-data/package.json';
import * as packageLayers from '@tensorflow/tfjs-layers/package.json';
import * as packageConverter from '@tensorflow/tfjs-converter/package.json';
// for backends, get version from source so it can register backend during import
import { version_cpu } from '@tensorflow/tfjs-backend-cpu/dist/index.js';
import { version_webgl } from '@tensorflow/tfjs-backend-webgl/dist/index.js';
import { version_wasm } from '@tensorflow/tfjs-backend-wasm/dist/index.js';

// export all - compiled
export * from '@tensorflow/tfjs-core/dist/index.js';
export * from '@tensorflow/tfjs-layers/dist/index.js';
export * from '@tensorflow/tfjs-converter/dist/index.js';
export * as data from '@tensorflow/tfjs-data/dist/index.js';
export * from '@tensorflow/tfjs-backend-cpu/dist/index.js';
export * from '@tensorflow/tfjs-backend-webgl/dist/index.js';
export * from '@tensorflow/tfjs-backend-wasm/dist/index.js';

// export all - sources
/*
export * from '@tensorflow/tfjs-core/src/index';
export * from '@tensorflow/tfjs-layers/src/index';
export * from '@tensorflow/tfjs-converter/src/index';
export * as data from '@tensorflow/tfjs-data/src/index';
export * from '@tensorflow/tfjs-backend-cpu/src/index';
export * from '@tensorflow/tfjs-backend-webgl/src/index';
export * from '@tensorflow/tfjs-backend-wasm/src/index';
*/

// export versions
export const version = {
  tfjs: packageBundle?.version || undefined,
  'tfjs-core': packageCore?.version || undefined,
  'tfjs-data': packageData?.version || undefined,
  'tfjs-layers': packageLayers?.version || undefined,
  'tfjs-converter': packageConverter?.version || undefined,
  'tfjs-backend-cpu': version_cpu || undefined,
  'tfjs-backend-webgl': version_webgl || undefined,
  'tfjs-backend-wasm': version_wasm || undefined,
};
// export const version = {};
