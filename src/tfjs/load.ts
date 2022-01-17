import { log, join } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import type { GraphModel } from './types';
import type { Config } from '../config';

const options = {
  cacheModels: false,
  verbose: true,
  debug: false,
  modelBasePath: '',
};

async function httpHandler(url, init?): Promise<Response | null> {
  if (options.debug) log('load model fetch:', url, init);
  if (typeof fetch === 'undefined') {
    log('error loading model: fetch function is not defined:');
    return null;
  }
  return fetch(url, init);
}

export function setModelLoadOptions(config: Config) {
  options.cacheModels = config.cacheModels;
  options.verbose = config.debug;
  options.modelBasePath = config.modelBasePath;
}

export async function loadModel(modelPath: string | undefined): Promise<GraphModel> {
  const modelUrl = join(options.modelBasePath, modelPath || '');
  const modelPathSegments = modelUrl.split('/');
  const cachedModelName = 'indexeddb://' + modelPathSegments[modelPathSegments.length - 1].replace('.json', ''); // generate short model name for cache
  const cachedModels = await tf.io.listModels(); // list all models already in cache
  const modelCached = options.cacheModels && Object.keys(cachedModels).includes(cachedModelName); // is model found in cache
  // create model prototype and decide if load from cache or from original modelurl
  const model: GraphModel = new tf.GraphModel(modelCached ? cachedModelName : modelUrl, { fetchFunc: (url, init?) => httpHandler(url, init) }) as unknown as GraphModel;
  try {
    // @ts-ignore private function
    model.findIOHandler(); // decide how to actually load a model
    // @ts-ignore private property
    if (options.debug) log('model load handler:', model.handler);
    // @ts-ignore private property
    const artifacts = await model.handler.load(); // load manifest
    model.loadSync(artifacts); // load weights
    if (options.verbose) log('load model:', model['modelUrl']);
  } catch (err) {
    log('error loading model:', modelUrl, err);
  }
  if (options.cacheModels && !modelCached) { // save model to cache
    try {
      const saveResult = await model.save(cachedModelName);
      log('model saved:', cachedModelName, saveResult);
    } catch (err) {
      log('error saving model:', modelUrl, err);
    }
  }
  return model;
}
