/**
 * Loader and Validator for all models used by Human
 */

import { env } from './util/env';
import { log } from './util/util';
import * as gear from './gear/gear';
import * as ssrnetAge from './gear/ssrnet-age';
import * as ssrnetGender from './gear/ssrnet-gender';
import * as antispoof from './face/antispoof';
import * as blazeface from './face/blazeface';
import * as blazepose from './body/blazepose';
import * as centernet from './object/centernet';
import * as efficientpose from './body/efficientpose';
import * as emotion from './gear/emotion';
import * as mobilefacenet from './face/mobilefacenet';
import * as facemesh from './face/facemesh';
import * as faceres from './face/faceres';
import * as handpose from './hand/handpose';
import * as handtrack from './hand/handtrack';
import * as iris from './face/iris';
import * as liveness from './face/liveness';
import * as movenet from './body/movenet';
import * as nanodet from './object/nanodet';
import * as posenet from './body/posenet';
import * as segmentation from './segmentation/segmentation';
import { modelStats } from './tfjs/load';
import type { GraphModel } from './tfjs/types';
import type { Human } from './human';

/** Instances of all possible TFJS Graph Models used by Human
 * - loaded as needed based on configuration
 * - initialized explictly with `human.load()` method
 * - initialized implicity on first call to `human.detect()`
 * - each model can be `null` if not loaded, instance of `GraphModel` if loaded or `Promise` if loading
 */
export class Models {
  ssrnetage: null | GraphModel | Promise<GraphModel> = null;
  gear: null | GraphModel | Promise<GraphModel> = null;
  blazeposedetect: null | GraphModel | Promise<GraphModel> = null;
  blazepose: null | GraphModel | Promise<GraphModel> = null;
  centernet: null | GraphModel | Promise<GraphModel> = null;
  efficientpose: null | GraphModel | Promise<GraphModel> = null;
  mobilefacenet: null | GraphModel | Promise<GraphModel> = null;
  emotion: null | GraphModel | Promise<GraphModel> = null;
  facedetect: null | GraphModel | Promise<GraphModel> = null;
  faceiris: null | GraphModel | Promise<GraphModel> = null;
  facemesh: null | GraphModel | Promise<GraphModel> = null;
  faceres: null | GraphModel | Promise<GraphModel> = null;
  ssrnetgender: null | GraphModel | Promise<GraphModel> = null;
  handpose: null | GraphModel | Promise<GraphModel> = null;
  handskeleton: null | GraphModel | Promise<GraphModel> = null;
  handtrack: null | GraphModel | Promise<GraphModel> = null;
  liveness: null | GraphModel | Promise<GraphModel> = null;
  movenet: null | GraphModel | Promise<GraphModel> = null;
  nanodet: null | GraphModel | Promise<GraphModel> = null;
  posenet: null | GraphModel | Promise<GraphModel> = null;
  segmentation: null | GraphModel | Promise<GraphModel> = null;
  antispoof: null | GraphModel | Promise<GraphModel> = null;
}

export const getModelStats = () => {
  let sizeFromManifest = 0;
  let sizeWeights = 0;
  for (const m of Object.values(modelStats)) {
    sizeFromManifest += m.manifest;
    sizeWeights += m.weights;
  }
  return { numLoadedModels: Object.values(modelStats).length, sizeFromManifest, sizeWeights };
};

export function reset(instance: Human): void {
  // if (instance.config.debug) log('resetting loaded models');
  for (const model of Object.keys(instance.models)) instance.models[model as keyof Models] = null;
}

/** Load method preloads all instance.configured models on-demand */
export async function load(instance: Human): Promise<void> {
  if (env.initial) reset(instance);
  if (instance.config.hand.enabled) { // handpose model is a combo that must be loaded as a whole
    if (!instance.models.handpose && instance.config.hand.detector?.modelPath?.includes('handdetect')) {
      [instance.models.handpose, instance.models.handskeleton] = await handpose.load(instance.config);
    }
    if (!instance.models.handskeleton && instance.config.hand.landmarks && instance.config.hand.detector?.modelPath?.includes('handdetect')) {
      [instance.models.handpose, instance.models.handskeleton] = await handpose.load(instance.config);
    }
  }
  if (instance.config.body.enabled && !instance.models.blazepose && instance.config.body?.modelPath?.includes('blazepose')) instance.models.blazepose = blazepose.loadPose(instance.config);
  // @ts-ignore optional model
  if (instance.config.body.enabled && !instance.models.blazeposedetect && instance.config.body['detector'] && instance.config.body['detector']['modelPath']) instance.models.blazeposedetect = blazepose.loadDetect(instance.config);
  if (instance.config.body.enabled && !instance.models.efficientpose && instance.config.body?.modelPath?.includes('efficientpose')) instance.models.efficientpose = efficientpose.load(instance.config);
  if (instance.config.body.enabled && !instance.models.movenet && instance.config.body?.modelPath?.includes('movenet')) instance.models.movenet = movenet.load(instance.config);
  if (instance.config.body.enabled && !instance.models.posenet && instance.config.body?.modelPath?.includes('posenet')) instance.models.posenet = posenet.load(instance.config);
  if (instance.config.face.enabled && !instance.models.facedetect) instance.models.facedetect = blazeface.load(instance.config);
  if (instance.config.face.enabled && instance.config.face.antispoof?.enabled && !instance.models.antispoof) instance.models.antispoof = antispoof.load(instance.config);
  if (instance.config.face.enabled && instance.config.face.liveness?.enabled && !instance.models.liveness) instance.models.liveness = liveness.load(instance.config);
  if (instance.config.face.enabled && instance.config.face.description?.enabled && !instance.models.faceres) instance.models.faceres = faceres.load(instance.config);
  if (instance.config.face.enabled && instance.config.face.emotion?.enabled && !instance.models.emotion) instance.models.emotion = emotion.load(instance.config);
  if (instance.config.face.enabled && instance.config.face.iris?.enabled && !instance.config.face.attention?.enabled && !instance.models.faceiris) instance.models.faceiris = iris.load(instance.config);
  if (instance.config.face.enabled && instance.config.face.mesh?.enabled && !instance.models.facemesh) instance.models.facemesh = facemesh.load(instance.config);
  // @ts-ignore optional model
  if (instance.config.face.enabled && instance.config.face['gear']?.enabled && !instance.models.gear) instance.models.gear = gear.load(instance.config);
  // @ts-ignore optional model
  if (instance.config.face.enabled && instance.config.face['ssrnet']?.enabled && !instance.models.ssrnetage) instance.models.ssrnetage = ssrnetAge.load(instance.config);
  // @ts-ignore optional model
  if (instance.config.face.enabled && instance.config.face['ssrnet']?.enabled && !instance.models.ssrnetgender) instance.models.ssrnetgender = ssrnetGender.load(instance.config);
  // @ts-ignore optional model
  if (instance.config.face.enabled && instance.config.face['mobilefacenet']?.enabled && !instance.models.mobilefacenet) instance.models.mobilefacenet = mobilefacenet.load(instance.config);
  if (instance.config.hand.enabled && !instance.models.handtrack && instance.config.hand.detector?.modelPath?.includes('handtrack')) instance.models.handtrack = handtrack.loadDetect(instance.config);
  if (instance.config.hand.enabled && instance.config.hand.landmarks && !instance.models.handskeleton && instance.config.hand.detector?.modelPath?.includes('handtrack')) instance.models.handskeleton = handtrack.loadSkeleton(instance.config);
  if (instance.config.object.enabled && !instance.models.centernet && instance.config.object?.modelPath?.includes('centernet')) instance.models.centernet = centernet.load(instance.config);
  if (instance.config.object.enabled && !instance.models.nanodet && instance.config.object?.modelPath?.includes('nanodet')) instance.models.nanodet = nanodet.load(instance.config);
  if (instance.config.segmentation.enabled && !instance.models.segmentation) instance.models.segmentation = segmentation.load(instance.config);

  // models are loaded in parallel asynchronously so lets wait until they are actually loaded
  for await (const model of Object.keys(instance.models)) {
    if (instance.models[model as keyof Models] && typeof instance.models[model as keyof Models] !== 'undefined') {
      instance.models[model as keyof Models] = await instance.models[model as keyof Models];
    }
  }
}

export async function validate(instance: Human): Promise<void> {
  interface Op { name: string, category: string, op: string }
  const simpleOps = ['const', 'placeholder', 'noop', 'pad', 'squeeze', 'add', 'sub', 'mul', 'div'];
  for (const defined of Object.keys(instance.models)) {
    const model: GraphModel | null = instance.models[defined as keyof Models] as GraphModel | null;
    if (!model) continue;
    const ops: string[] = [];
    // @ts-ignore // executor is a private method
    const executor = model?.executor;
    if (executor && executor.graph.nodes) {
      for (const kernel of Object.values(executor.graph.nodes)) {
        const op = (kernel as Op).op.toLowerCase();
        if (!ops.includes(op)) ops.push(op);
      }
    } else {
      if (!executor && instance.config.debug) log('model signature not determined:', defined);
    }
    const missing: string[] = [];
    for (const op of ops) {
      if (!simpleOps.includes(op) // exclude simple ops
        && !instance.env.kernels.includes(op) // check actual kernel ops
        && !instance.env.kernels.includes(op.replace('_', '')) // check variation without _
        && !instance.env.kernels.includes(op.replace('native', '')) // check standard variation
        && !instance.env.kernels.includes(op.replace('v2', ''))) { // check non-versioned variation
        missing.push(op);
      }
    }
    // log('model validation ops:', defined, ops);
    if (instance.config.debug && missing.length > 0) log('model validation failed:', defined, missing);
  }
}
