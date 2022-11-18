/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

export * from 'types/tfjs.esm';

export declare const version: {
  'tfjs-core': string;
  'tfjs-backend-cpu': string;
  'tfjs-backend-webgl': string;
  'tfjs-data': string;
  'tfjs-layers': string;
  'tfjs-converter': string;
  tfjs: string;
};

export * from '@tensorflow/tfjs-core';
export * from '@tensorflow/tfjs-converter';
export * from '@tensorflow/tfjs-data';
export * from '@tensorflow/tfjs-layers';
export * from '@tensorflow/tfjs-backend-cpu';
export * from '@tensorflow/tfjs-backend-wasm';
export * from '@tensorflow/tfjs-backend-webgl';
export * from '@tensorflow/tfjs-backend-webgpu';
export * from '@tensorflow/tfjs-node';
export * from '@tensorflow/tfjs-node-gpu';
