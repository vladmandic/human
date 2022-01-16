import { log, mergeDeep } from '../util/util';
import * as tf from '../../dist/tfjs.esm.js';
import type { GraphModel } from './types';

type FetchFunc = (url: RequestInfo, init?: RequestInit) => Promise<Response>;
type ProgressFunc = (...args) => void;

export type LoadOptions = {
  appName: string,
  autoSave: boolean,
  verbose: boolean,
  fetchFunc?: FetchFunc,
  onProgress?: ProgressFunc,
}

let options: LoadOptions = {
  appName: 'human',
  autoSave: true,
  verbose: true,
};

async function httpHandler(url: RequestInfo, init?: RequestInit): Promise<Response | null> {
  if (options.fetchFunc) return options.fetchFunc(url, init);
  else log('error: fetch function is not defined');
  return null;
}

const tfLoadOptions = {
  onProgress: (...args) => {
    if (options.onProgress) options.onProgress(...args);
    else if (options.verbose) log('load model progress:', ...args);
  },
  fetchFunc: (url: RequestInfo, init?: RequestInit) => {
    if (options.verbose) log('load model fetch:', url, init);
    if (url.toString().toLowerCase().startsWith('http')) return httpHandler(url, init);
    return null;
  },
};

export async function loadModel(modelUrl: string, loadOptions?: LoadOptions): Promise<GraphModel> {
  if (loadOptions) options = mergeDeep(loadOptions);
  if (!options.fetchFunc && (typeof globalThis.fetch !== 'undefined')) options.fetchFunc = globalThis.fetch;
  const model = await tf.loadGraphModel(modelUrl, tfLoadOptions) as unknown as GraphModel;
  return model;
}
