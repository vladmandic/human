import * as tf from 'dist/tfjs.esm.js';
import { log, join } from '../util/util';
import type { GraphModel } from './types';
import type { Config } from '../config';
import * as modelsDefs from '../../models/models.json';

const options = {
  cacheModels: true,
  cacheSupported: true,
  verbose: true,
  debug: false,
  modelBasePath: '',
};

export interface ModelInfo {
  name: string,
  loaded: boolean,
  inCache: boolean,
  sizeDesired: number,
  sizeFromManifest: number,
  sizeLoadedWeights: number,
  url: string,
}

export const modelStats: Record<string, ModelInfo> = {};

async function httpHandler(url: string, init?: RequestInit): Promise<Response | null> {
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
  const modelPathSegments = modelUrl.includes('/') ? modelUrl.split('/') : modelUrl.split('\\');
  const shortModelName = modelPathSegments[modelPathSegments.length - 1].replace('.json', '');
  const cachedModelName = 'indexeddb://' + shortModelName; // generate short model name for cache
  modelStats[shortModelName] = {
    name: shortModelName,
    loaded: false,
    sizeFromManifest: 0,
    sizeLoadedWeights: 0,
    sizeDesired: modelsDefs[shortModelName],
    inCache: false,
    url: '',
  };
  options.cacheSupported = (typeof indexedDB !== 'undefined'); // check if localStorage and indexedb are available
  let cachedModels = {};
  try {
    cachedModels = (options.cacheSupported && options.cacheModels) ? await tf.io.listModels() : {}; // list all models already in cache // this fails for webview although localStorage is defined
  } catch {
    options.cacheSupported = false;
  }
  modelStats[shortModelName].inCache = (options.cacheSupported && options.cacheModels) && Object.keys(cachedModels).includes(cachedModelName); // is model found in cache
  modelStats[shortModelName].url = modelStats[shortModelName].inCache ? cachedModelName : modelUrl;
  const tfLoadOptions = typeof fetch === 'undefined' ? {} : { fetchFunc: (url: string, init?: RequestInit) => httpHandler(url, init) };
  let model: GraphModel = new tf.GraphModel(modelStats[shortModelName].url, tfLoadOptions) as unknown as GraphModel; // create model prototype and decide if load from cache or from original modelurl
  modelStats[shortModelName].loaded = false;
  try {
    // @ts-ignore private function
    model.findIOHandler(); // decide how to actually load a model
    if (options.debug) log('model load handler:', model['handler']);
  } catch (err) {
    log('error finding model i/o handler:', modelUrl, err);
  }
  try {
    // @ts-ignore private property
    const artifacts = await model.handler?.load() || null; // load manifest
    modelStats[shortModelName].sizeFromManifest = artifacts?.weightData?.byteLength || 0;
    if (artifacts) model.loadSync(artifacts); // load weights
    else model = await tf.loadGraphModel(modelStats[shortModelName].inCache ? cachedModelName : modelUrl, tfLoadOptions) as unknown as GraphModel;
    // @ts-ignore private property
    modelStats[shortModelName].sizeLoadedWeights = model.artifacts?.weightData?.byteLength || model.artifacts?.weightData?.[0].byteLength || 0;
    if (options.verbose) log('load:', { model: shortModelName, url: model['modelUrl'], bytes: modelStats[shortModelName].sizeLoadedWeights });
    modelStats[shortModelName].loaded = true;
  } catch (err) {
    log('error loading model:', modelUrl, err);
  }
  if (modelStats[shortModelName].loaded && options.cacheModels && options.cacheSupported && !modelStats[shortModelName].inCache) { // save model to cache
    try {
      const saveResult = await model.save(cachedModelName);
      if (options.debug) log('model saved:', cachedModelName, saveResult);
    } catch (err) {
      log('error saving model:', modelUrl, err);
    }
  }
  return model;
}
