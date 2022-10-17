/* eslint-disable import/no-extraneous-dependencies */

/**
 * TensorFlow
 * @external
 */
export type { version_core } from '@tensorflow/tfjs-core'; // eslint-disable-line camelcase
export type { image, browser, io } from '@tensorflow/tfjs-core';
export type { clone, sum, transpose, addN, softmax, tile, cast, unstack, pad, div, split, squeeze, add, mul, sub, stack, sigmoid, argMax, reshape, max, mod, min, floorDiv } from '@tensorflow/tfjs-core';
export type { slice, slice3d, slice4d, concat, concat2d, expandDims } from '@tensorflow/tfjs-core';
export type { fill, scalar, tensor2d, zeros, tensor, dispose, tensor1d, tidy, ready, getBackend, registerKernel, engine, env, setBackend, enableProdMode, getKernelsForBackend, findBackend, registerBackend, backend } from '@tensorflow/tfjs-core';
export type { Tensor, Tensor1D, Tensor2D, Tensor3D, Tensor4D, TensorLike, TensorInfo, DataType, Rank, TensorContainer, TensorContainerObject } from '@tensorflow/tfjs-core';
export type { loadGraphModel, GraphModel } from '@tensorflow/tfjs-converter';
export type { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
export type { setWebGLContext, GPGPUContext, MathBackendWebGL } from '@tensorflow/tfjs-backend-webgl';

/*
export type { version_core } from '@vladmandic/tfjs/dist/tfjs-core.esm'; // eslint-disable-line camelcase
export type { image, browser, io } from '@vladmandic/tfjs/dist/tfjs-core.esm';
export type { clone, sum, transpose, addN, softmax, tile, cast, unstack, pad, div, split, squeeze, add, mul, sub, stack, sigmoid, argMax, reshape, max, mod, min, floorDiv } from '@vladmandic/tfjs/dist/tfjs-core.esm';
export type { slice, slice3d, slice4d, concat, concat2d, expandDims } from '@tensorflow/tfjs-core';
export type { fill, scalar, tensor2d, zeros, tensor, dispose, tensor1d, tidy, ready, getBackend, registerKernel, engine, env, setBackend, enableProdMode, getKernelsForBackend, findBackend, registerBackend, backend } from '@vladmandic/tfjs/dist/tfjs-core.esm';
export type { Tensor, Tensor1D, Tensor2D, Tensor3D, Tensor4D, TensorLike, TensorInfo, DataType, Rank, TensorContainer, TensorContainerObject } from '@vladmandic/tfjs/dist/tfjs-core.esm';
export type { loadGraphModel, GraphModel } from '@vladmandic/tfjs/dist/tfjs.esm';
export type { setWasmPaths } from '@vladmandic/tfjs/dist/tfjs.esm';
export type { setWebGLContext, GPGPUContext, MathBackendWebGL } from '@vladmandic/tfjs/dist/tfjs.esm';
*/

export declare const version: {
  'tfjs-core': string;
  'tfjs-backend-cpu': string;
  'tfjs-backend-webgl': string;
  'tfjs-data': string;
  'tfjs-layers': string;
  'tfjs-converter': string;
  tfjs: string;
};
