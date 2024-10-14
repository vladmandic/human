/**
 * Loader and Validator for all models used by Human
 */

import { env } from './util/env';
import { log } from './util/util';
import * as antispoof from './face/antispoof';
import * as blazeface from './face/blazeface';
import * as blazepose from './body/blazepose';
import * as centernet from './object/centernet';
import * as efficientpose from './body/efficientpose';
import * as emotion from './gear/emotion';
import * as facemesh from './face/facemesh';
import * as faceres from './face/faceres';
import * as gear from './gear/gear';
import * as handpose from './hand/handpose';
import * as handtrack from './hand/handtrack';
import * as insightface from './face/insightface';
import * as iris from './face/iris';
import * as liveness from './face/liveness';
import * as meet from './segmentation/meet';
import * as mobilefacenet from './face/mobilefacenet';
import * as movenet from './body/movenet';
import * as nanodet from './object/nanodet';
import * as posenet from './body/posenet';
import * as rvm from './segmentation/rvm';
import * as selfie from './segmentation/selfie';
import * as ssrnetAge from './gear/ssrnet-age';
import * as ssrnetGender from './gear/ssrnet-gender';
import { modelStats, ModelInfo } from './tfjs/load';
import type { GraphModel } from './tfjs/types';
import type { Human } from './human';

export interface KernelOps { name: string, url: string, missing: string[], ops: string[] }

export function validateModel(instance: Human | null, model: GraphModel | null, name: string): KernelOps | null {
  if (!model) return null;
  if (!instance?.config?.validateModels) return null;
  const simpleOps = ['const', 'placeholder', 'noop', 'pad', 'squeeze', 'add', 'sub', 'mul', 'div'];
  const ignoreOps = ['biasadd', 'fusedbatchnormv3', 'matmul', 'switch', 'shape', 'merge', 'split', 'broadcastto'];
  const ops: string[] = [];
  const missing: string[] = [];
  interface Op { name: string, category: string, op: string }
  const url = model['modelUrl'] as string;
  const executor = model['executor'];
  if (executor?.graph?.nodes) {
    for (const kernel of Object.values(executor.graph.nodes)) {
      const op = (kernel as Op).op.toLowerCase();
      if (!ops.includes(op)) ops.push(op);
    }
  } else {
    if (!executor && instance.config.debug) {
      log('model not loaded', name);
    }
  }
  for (const op of ops) {
    if (!simpleOps.includes(op) // exclude simple ops
      && !ignoreOps.includes(op) // exclude specific ops
      && !instance.env.kernels.includes(op) // check actual kernel ops
      && !instance.env.kernels.includes(op.replace('_', '')) // check variation without _
      && !instance.env.kernels.includes(op.replace('native', '')) // check standard variation
      && !instance.env.kernels.includes(op.replace('v2', ''))) { // check non-versioned variation
      missing.push(op);
    }
  }
  if (instance.config.debug && missing.length > 0) log('model validation failed:', name, missing);
  return missing.length > 0 ? { name, missing, ops, url } : null;
}

/** structure that holds global stats for currently loaded models */
export interface ModelStats {
  numLoadedModels: number,
  numDefinedModels: number,
  percentageLoaded: number,
  totalSizeFromManifest: number,
  totalSizeWeights: number,
  totalSizeLoading: number,
  modelStats: ModelInfo[],
}

/** Models class used by Human
 * - models: record of all GraphModels
 * - list: returns list of configured models with their stats
 * - loaded: returns array of loaded models
 * - reset: unloads all models
 * - validate: checks loaded models for valid kernel ops vs current backend
 * - stats: live detailed model stats that can be checked during model load phase
 */
export class Models {
  private instance: Human;
  models: Record<string, null | GraphModel> = {};

  constructor(currentInstance: Human) {
    this.models = {};
    this.instance = currentInstance;
  }

  stats(): ModelStats {
    let totalSizeFromManifest = 0;
    let totalSizeWeights = 0;
    let totalSizeLoading = 0;
    for (const m of Object.values(modelStats)) {
      totalSizeFromManifest += Number.isNaN(+m.sizeFromManifest) ? 0 : m.sizeFromManifest;
      totalSizeWeights += Number.isNaN(+m.sizeLoadedWeights) ? 0 : m.sizeLoadedWeights;
      totalSizeLoading += Number.isNaN(+m.sizeDesired) ? 0 : m.sizeDesired;
    }
    const percentageLoaded = totalSizeLoading > 0 ? totalSizeWeights / totalSizeLoading : 0;
    return {
      numLoadedModels: Object.values(modelStats).filter((m) => m?.loaded).length,
      numDefinedModels: Object.keys(this.models).length,
      percentageLoaded,
      totalSizeFromManifest,
      totalSizeWeights,
      totalSizeLoading,
      modelStats: Object.values(modelStats),
    };
  }

  reset(): void {
    for (const model of Object.keys(this.models)) this.models[model] = null;
  }

  async load(instance?: Human): Promise<void> {
    if (env.initial) this.reset();
    if (instance) this.instance = instance;
    const m: Record<string, null | GraphModel | Promise<GraphModel>> = {};
    // face main models
    m.blazeface = (this.instance.config.face.enabled && !this.models.blazeface) ? blazeface.load(this.instance.config) : null;
    m.antispoof = (this.instance.config.face.enabled && this.instance.config.face.antispoof?.enabled && !this.models.antispoof) ? antispoof.load(this.instance.config) : null;
    m.liveness = (this.instance.config.face.enabled && this.instance.config.face.liveness?.enabled && !this.models.liveness) ? liveness.load(this.instance.config) : null;
    m.faceres = (this.instance.config.face.enabled && this.instance.config.face.description?.enabled && !this.models.faceres) ? faceres.load(this.instance.config) : null;
    m.emotion = (this.instance.config.face.enabled && this.instance.config.face.emotion?.enabled && !this.models.emotion) ? emotion.load(this.instance.config) : null;
    m.iris = (this.instance.config.face.enabled && this.instance.config.face.iris?.enabled && !this.instance.config.face.attention?.enabled && !this.models.iris) ? iris.load(this.instance.config) : null;
    m.facemesh = (this.instance.config.face.enabled && this.instance.config.face.mesh?.enabled && (!this.models.facemesh)) ? facemesh.load(this.instance.config) : null;
    // face alternatives
    m.gear = (this.instance.config.face.enabled && this.instance.config.face['gear']?.enabled && !this.models.gear) ? gear.load(this.instance.config) : null;
    m.ssrnetage = (this.instance.config.face.enabled && this.instance.config.face['ssrnet']?.enabled && !this.models.ssrnetage) ? ssrnetAge.load(this.instance.config) : null;
    m.ssrnetgender = (this.instance.config.face.enabled && this.instance.config.face['ssrnet']?.enabled && !this.models.ssrnetgender) ? ssrnetGender.load(this.instance.config) : null;
    m.mobilefacenet = (this.instance.config.face.enabled && this.instance.config.face['mobilefacenet']?.enabled && !this.models.mobilefacenet) ? mobilefacenet.load(this.instance.config) : null;
    m.insightface = (this.instance.config.face.enabled && this.instance.config.face['insightface']?.enabled && !this.models.insightface) ? insightface.load(this.instance.config) : null;
    // body alterinatives
    m.blazepose = (this.instance.config.body.enabled && !this.models.blazepose && this.instance.config.body.modelPath?.includes('blazepose')) ? blazepose.loadPose(this.instance.config) : null;
    m.blazeposedetect = (this.instance.config.body.enabled && !this.models.blazeposedetect && this.instance.config.body['detector'] && this.instance.config.body['detector'].modelPath) ? blazepose.loadDetect(this.instance.config) : null;
    m.efficientpose = (this.instance.config.body.enabled && !this.models.efficientpose && this.instance.config.body.modelPath?.includes('efficientpose')) ? efficientpose.load(this.instance.config) : null;
    m.movenet = (this.instance.config.body.enabled && !this.models.movenet && this.instance.config.body.modelPath?.includes('movenet')) ? movenet.load(this.instance.config) : null;
    m.posenet = (this.instance.config.body.enabled && !this.models.posenet && this.instance.config.body.modelPath?.includes('posenet')) ? posenet.load(this.instance.config) : null;
    // hand alternatives
    m.handtrack = (this.instance.config.hand.enabled && !this.models.handtrack && this.instance.config.hand.detector?.modelPath?.includes('handtrack')) ? handtrack.loadDetect(this.instance.config) : null;
    m.handskeleton = (this.instance.config.hand.enabled && this.instance.config.hand.landmarks && !this.models.handskeleton && this.instance.config.hand.detector?.modelPath?.includes('handtrack')) ? handtrack.loadSkeleton(this.instance.config) : null;
    // if (this.instance.config.hand.detector?.modelPath?.includes('handdetect')) [m.handpose, m.handskeleton] = (!this.models.handpose) ? await handpose.load(this.instance.config) : [null, null];
    if (this.instance.config.hand.enabled && !this.models.handdetect && this.instance.config.hand.detector?.modelPath?.includes('handdetect')) {
      m.handdetect = handpose.loadDetect(this.instance.config);
      m.handskeleton = handpose.loadSkeleton(this.instance.config);
    }
    // object detection alternatives
    m.centernet = (this.instance.config.object.enabled && !this.models.centernet && this.instance.config.object.modelPath?.includes('centernet')) ? centernet.load(this.instance.config) : null;
    m.nanodet = (this.instance.config.object.enabled && !this.models.nanodet && this.instance.config.object.modelPath?.includes('nanodet')) ? nanodet.load(this.instance.config) : null;
    // segmentation alternatives
    m.selfie = (this.instance.config.segmentation.enabled && !this.models.selfie && this.instance.config.segmentation.modelPath?.includes('selfie')) ? selfie.load(this.instance.config) : null;
    m.meet = (this.instance.config.segmentation.enabled && !this.models.meet && this.instance.config.segmentation.modelPath?.includes('meet')) ? meet.load(this.instance.config) : null;
    m.rvm = (this.instance.config.segmentation.enabled && !this.models.rvm && this.instance.config.segmentation.modelPath?.includes('rvm')) ? rvm.load(this.instance.config) : null;

    // models are loaded in parallel asynchronously so lets wait until they are actually loaded
    for (const [model, promise] of Object.entries(m)) {
      if (promise?.['then']) promise['then']((val) => this.models[model] = val);
    }
    await Promise.all(Object.values(m)); // wait so this function does not resolve prematurely
  }

  list() {
    const models = Object.keys(this.models).map((model) => ({ name: model, loaded: (this.models[model] !== null), size: 0, url: this.models[model] ? this.models[model]?.['modelUrl'] : null }));
    for (const m of models) {
      const stats = Object.keys(modelStats).find((s) => s.startsWith(m.name));
      if (!stats) continue;
      m.size = modelStats[stats].sizeLoadedWeights;
      m.url = modelStats[stats].url;
    }
    return models;
  }

  loaded(): string[] {
    const list = this.list();
    const loaded = list.filter((model) => model.loaded).map((model) => model.name);
    return loaded;
  }

  validate(): { name: string, missing: string[] }[] {
    const missing: KernelOps[] = [];
    for (const defined of Object.keys(this.models)) {
      const model: GraphModel | null = this.models[defined as keyof Models];
      if (!model) continue;
      const res = validateModel(this.instance, model, defined);
      if (res) missing.push(res);
    }
    return missing;
  }
}
