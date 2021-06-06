/**
 * Creates tfjs bundle used by Human browser build target
 */

// import from dist
// modules: 1299, moduleBytes: 4230827, imports: 7, importBytes: 2478, outputBytes: 2357435
// get versions of all packages
import * as packageBundle from '@tensorflow/tfjs/package.json';
import * as packageCore from '@tensorflow/tfjs-core/package.json';
import * as packageData from '@tensorflow/tfjs-data/package.json';
import * as packageLayers from '@tensorflow/tfjs-layers/package.json';
import * as packageConverter from '@tensorflow/tfjs-converter/package.json';
// for backends, get version from source so it can register backend during import
import { version_cpu } from '@tensorflow/tfjs-backend-cpu/dist/index.js';
import { version_webgl } from '@tensorflow/tfjs-backend-webgl/dist/index.js';
import { version_wasm } from '@tensorflow/tfjs-backend-wasm/dist/index.js';

// export all
export * from '@tensorflow/tfjs-core/dist/index.js';
export * from '@tensorflow/tfjs-layers/dist/index.js';
export * from '@tensorflow/tfjs-converter/dist/index.js';
export * as data from '@tensorflow/tfjs-data/dist/index.js';
export * from '@tensorflow/tfjs-backend-cpu/dist/index.js';
export * from '@tensorflow/tfjs-backend-webgl/dist/index.js';
export * from '@tensorflow/tfjs-backend-wasm/dist/index.js';

// import from src
// modules: 1681, moduleBytes: 5711239, imports: 7, importBytes: 2701, outputBytes: 2107830
// get versions of all packages
/*
import * as packageBundle from '@tensorflow/tfjs/package.json';
import * as packageCore from '@tensorflow/tfjs-core/package.json';
import * as packageData from '@tensorflow/tfjs-data/package.json';
import * as packageLayers from '@tensorflow/tfjs-layers/package.json';
import * as packageConverter from '@tensorflow/tfjs-converter/package.json';
import { version_cpu } from '@tensorflow/tfjs-backend-cpu/src/index';
import { version_webgl } from '@tensorflow/tfjs-backend-webgl/src/index';
import { version_wasm } from '@tensorflow/tfjs-backend-wasm/src/index';

// export all
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
