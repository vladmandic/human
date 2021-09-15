// get versions of all packages
import { version as tfjsVersion } from '@tensorflow/tfjs/package.json';
import { version as tfjsCoreVersion } from '@tensorflow/tfjs-core/package.json';
import { version as tfjsDataVersion } from '@tensorflow/tfjs-data/package.json';
import { version as tfjsLayersVersion } from '@tensorflow/tfjs-layers/package.json';
import { version as tfjsConverterVersion } from '@tensorflow/tfjs-converter/package.json';
import { version as tfjsBackendCPUVersion } from '@tensorflow/tfjs-backend-cpu/package.json';
import { version as tfjsBackendWebGLVersion } from '@tensorflow/tfjs-backend-webgl/package.json';
import { version as tfjsBackendWASMVersion } from '@tensorflow/tfjs-backend-wasm/package.json';

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
