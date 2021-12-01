import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/register_all_gradients';
import '@tensorflow/tfjs-core/dist/public/chained_ops/register_all_chained_ops';
import '@tensorflow/tfjs-data';
import '@tensorflow/tfjs-layers';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgpu';

export declare const version: {
  'tfjs-core': string;
  'tfjs-backend-cpu': string;
  'tfjs-backend-webgl': string;
  'tfjs-data': string;
  'tfjs-layers': string;
  'tfjs-converter': string;
  tfjs: string;
};
