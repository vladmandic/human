import { log } from './helpers';
import type { GraphModel } from './tfjs/types';
import * as facemesh from './blazeface/facemesh';
import * as faceres from './faceres/faceres';
import * as emotion from './emotion/emotion';
import * as posenet from './posenet/posenet';
import * as handpose from './handpose/handpose';
import * as blazepose from './blazepose/blazepose';
import * as efficientpose from './efficientpose/efficientpose';
import * as movenet from './movenet/movenet';
import * as nanodet from './object/nanodet';
import * as centernet from './object/centernet';
import * as segmentation from './segmentation/segmentation';
import { env } from './env';
// import * as agegenderrace from './gear/agegenderrace';

export function reset(instance) {
  // if (instance.config.debug) log('resetting loaded models');
  instance.models = {
    face: null, // array of models
    handpose: null, // array of models
    posenet: null,
    blazepose: null,
    efficientpose: null,
    movenet: null,
    age: null,
    gender: null,
    emotion: null,
    embedding: null,
    nanodet: null,
    centernet: null,
    faceres: null,
    segmentation: null,
  };
}

/** Load method preloads all instance.configured models on-demand
 * - Not explicitly required as any required model is load implicitly on it's first run
 * @param userinstance.config?: {@link instance.config}
*/
export async function load(instance) {
  if (env.initial) reset(instance);
  if (instance.config.async) { // load models concurrently
    [
      instance.models.face,
      instance.models.emotion,
      instance.models.handpose,
      instance.models.posenet,
      instance.models.blazepose,
      instance.models.efficientpose,
      instance.models.movenet,
      instance.models.nanodet,
      instance.models.centernet,
      instance.models.faceres,
      instance.models.segmentation,
      // instance.models.agegenderrace,
    ] = await Promise.all([
      instance.models.face || (instance.config.face.enabled ? facemesh.load(instance.config) : null),
      instance.models.emotion || ((instance.config.face.enabled && instance.config.face.emotion.enabled) ? emotion.load(instance.config) : null),
      instance.models.handpose || (instance.config.hand.enabled ? handpose.load(instance.config) : null),
      instance.models.posenet || (instance.config.body.enabled && instance.config.body.modelPath.includes('posenet') ? posenet.load(instance.config) : null),
      instance.models.blazepose || (instance.config.body.enabled && instance.config.body.modelPath.includes('blazepose') ? blazepose.load(instance.config) : null),
      instance.models.efficientpose || (instance.config.body.enabled && instance.config.body.modelPath.includes('efficientpose') ? efficientpose.load(instance.config) : null),
      instance.models.movenet || (instance.config.body.enabled && instance.config.body.modelPath.includes('movenet') ? movenet.load(instance.config) : null),
      instance.models.nanodet || (instance.config.object.enabled && instance.config.object.modelPath.includes('nanodet') ? nanodet.load(instance.config) : null),
      instance.models.centernet || (instance.config.object.enabled && instance.config.object.modelPath.includes('centernet') ? centernet.load(instance.config) : null),
      instance.models.faceres || ((instance.config.face.enabled && instance.config.face.description.enabled) ? faceres.load(instance.config) : null),
      instance.models.segmentation || (instance.config.segmentation.enabled ? segmentation.load(instance.config) : null),
      // instance.models.agegenderrace || ((instance.config.face.enabled && instance.config.face.agegenderrace.enabled) ? agegenderrace.load(instance.config) : null),
    ]);
  } else { // load models sequentially
    if (instance.config.face.enabled && !instance.models.face) instance.models.face = await facemesh.load(instance.config);
    if (instance.config.face.enabled && instance.config.face.emotion.enabled && !instance.models.emotion) instance.models.emotion = await emotion.load(instance.config);
    if (instance.config.hand.enabled && !instance.models.handpose) instance.models.handpose = await handpose.load(instance.config);
    if (instance.config.body.enabled && !instance.models.posenet && instance.config.body.modelPath.includes('posenet')) instance.models.posenet = await posenet.load(instance.config);
    if (instance.config.body.enabled && !instance.models.blazepose && instance.config.body.modelPath.includes('blazepose')) instance.models.blazepose = await blazepose.load(instance.config);
    if (instance.config.body.enabled && !instance.models.efficientpose && instance.config.body.modelPath.includes('efficientpose')) instance.models.efficientpose = await blazepose.load(instance.config);
    if (instance.config.body.enabled && !instance.models.movenet && instance.config.body.modelPath.includes('movenet')) instance.models.movenet = await movenet.load(instance.config);
    if (instance.config.object.enabled && !instance.models.nanodet && instance.config.object.modelPath.includes('nanodet')) instance.models.nanodet = await nanodet.load(instance.config);
    if (instance.config.object.enabled && !instance.models.centernet && instance.config.object.modelPath.includes('centernet')) instance.models.centernet = await centernet.load(instance.config);
    if (instance.config.face.enabled && instance.config.face.description.enabled && !instance.models.faceres) instance.models.faceres = await faceres.load(instance.config);
    if (instance.config.segmentation.enabled && !instance.models.segmentation) instance.models.segmentation = await segmentation.load(instance.config);
    // if (instance.config.face.enabled && instance.config.face.agegenderrace.enabled && !instance.models.agegenderrace) instance.models.agegenderrace = await agegenderrace.load(instance.config);
  }
}

export async function validate(instance) {
  interface Op { name: string, category: string, op: string }
  const simpleOps = ['const', 'placeholder', 'noop', 'pad', 'squeeze', 'add', 'sub', 'mul', 'div'];
  for (const defined of Object.keys(instance.models)) {
    if (instance.models[defined]) { // check if model is loaded
      let models: GraphModel[] = [];
      if (Array.isArray(instance.models[defined])) {
        models = instance.models[defined]
          .filter((model) => (model !== null))
          .map((model) => ((model && model.executor) ? model : model.model));
      } else {
        models = [instance.models[defined]];
      }
      for (const model of models) {
        if (!model) {
          if (instance.config.debug) log('model marked as loaded but not defined:', defined);
          continue;
        }
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
        if (missing.length > 0 && instance.config.debug) log('model validation:', defined, missing);
      }
    }
  }
}
