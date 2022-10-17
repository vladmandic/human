/**
 * Creates tfjs bundle used by Human node-wasm build target
 */

/* eslint-disable import/no-extraneous-dependencies */

export * from '@tensorflow/tfjs-core';
export * from '@tensorflow/tfjs-converter';
export * from '@tensorflow/tfjs-backend-wasm';

export { version } from 'dist/tfjs.version.js';
