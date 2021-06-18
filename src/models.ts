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

/** Load method preloads all instance.configured models on-demand
 * - Not explicitly required as any required model is load implicitly on it's first run
 * @param userinstance.config?: {@link instance.config}
*/
export async function load(instance) {
  if (instance.config.async) { // load models concurrently
    [
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.face,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.emotion,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.handpose,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.posenet,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.blazepose,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.efficientpose,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.movenet,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.nanodet,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.centernet,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.faceres,
      // @ts-ignore models loaded via promise array cannot be correctly inferred
      instance.models.segmentation,
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
  }
}
