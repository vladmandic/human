// wrapper to load tfjs in a single place so version can be changed quickly

// simplified
// { modules: 1061, moduleBytes: 3772720, outputBytes: 1531035 }

// export * from '@tensorflow/tfjs/dist/index.js';
// export * from '@tensorflow/tfjs-backend-wasm';

// modular
// { modules: 1064, moduleBytes: 3793219, outputBytes: 1535600 }

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

// export all
export * from '@tensorflow/tfjs-core/dist/index.js';
export * from '@tensorflow/tfjs-layers/dist/index.js';
export * from '@tensorflow/tfjs-converter/dist/index.js';
export * as data from '@tensorflow/tfjs-data/dist/index.js';
export * from '@tensorflow/tfjs-backend-cpu/dist/index.js';
export * from '@tensorflow/tfjs-backend-webgl/dist/index.js';
export * from '@tensorflow/tfjs-backend-wasm/dist/index.js';

// export versions
export const version = {
  tfjs: packageBundle.version,
  'tfjs-core': packageCore.version,
  'tfjs-data': packageData.version,
  'tfjs-layers': packageLayers.version,
  'tfjs-converter': packageConverter.version,
  'tfjs-backend-cpu': version_cpu,
  'tfjs-backend-webgl': version_webgl,
  'tfjs-backend-wasm': version_wasm,
};
