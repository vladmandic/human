import { log, join } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import type { GraphModel } from './types';
import type { Config } from '../config';

const options = {
  cacheModels: true,
  cacheSupported: true,
  verbose: true,
  debug: false,
  modelBasePath: '',
};

type ModelStats = {
  name: string,
  cached: boolean,
  manifest: number,
  weights: number,
}

export const modelStats: Record<string, ModelStats> = {};

async function httpHandler(url, init?): Promise<Response | null> {
  if (options.debug) log('load model fetch:', url, init);
  return fetch(url, init);
}

export function setModelLoadOptions(config: Config) {
  options.cacheModels = config.cacheModels;
  options.verbose = config.debug;
  options.modelBasePath = config.modelBasePath;
}

export async function loadModel(modelPath: string | undefined): Promise<GraphModel> {
  let modelUrl = join(options.modelBasePath, modelPath || '');
  if (!modelUrl.toLowerCase().endsWith('.json')) modelUrl += '.json';
  const modelPathSegments = modelUrl.split('/');
  const shortModelName = modelPathSegments[modelPathSegments.length - 1].replace('.json', '');
  const cachedModelName = 'indexeddb://' + shortModelName; // generate short model name for cache
  modelStats[shortModelName] = {
    name: shortModelName,
    manifest: 0,
    weights: 0,
    cached: false,
  };
  options.cacheSupported = (typeof window !== 'undefined') && (typeof window.localStorage !== 'undefined') && (typeof window.indexedDB !== 'undefined'); // check if running in browser and if indexedb is available
  const cachedModels = (options.cacheSupported && options.cacheModels) ? await tf.io.listModels() : {}; // list all models already in cache
  modelStats[shortModelName].cached = (options.cacheSupported && options.cacheModels) && Object.keys(cachedModels).includes(cachedModelName); // is model found in cache
  const tfLoadOptions = typeof fetch === 'undefined' ? {} : { fetchFunc: (url, init?) => httpHandler(url, init) };
  const model: GraphModel = new tf.GraphModel(modelStats[shortModelName].cached ? cachedModelName : modelUrl, tfLoadOptions) as unknown as GraphModel; // create model prototype and decide if load from cache or from original modelurl
  let loaded = false;
  try {
    // @ts-ignore private function
    model.findIOHandler(); // decide how to actually load a model
    if (options.debug) log('model load handler:', model['handler']);
    // @ts-ignore private property
    const artifacts = await model.handler.load(); // load manifest
    modelStats[shortModelName].manifest = artifacts?.weightData?.byteLength || 0;
    model.loadSync(artifacts); // load weights
    // @ts-ignore private property
    modelStats[shortModelName].weights = model?.artifacts?.weightData?.byteLength || 0;
    if (options.verbose) log('load model:', model['modelUrl'], { bytes: modelStats[shortModelName].weights }, options);
    loaded = true;
  } catch (err) {
    log('error loading model:', modelUrl, err);
  }
  if (loaded && options.cacheModels && options.cacheSupported && !modelStats[shortModelName].cached) { // save model to cache
    try {
      const saveResult = await model.save(cachedModelName);
      log('model saved:', cachedModelName, saveResult);
    } catch (err) {
      log('error saving model:', modelUrl, err);
    }
  }
  return model;
}
