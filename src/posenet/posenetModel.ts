import * as tf from '../../dist/tfjs.esm.js';

const poseNetOutputs = ['MobilenetV1/offset_2/BiasAdd', 'MobilenetV1/heatmap_2/BiasAdd', 'MobilenetV1/displacement_fwd_2/BiasAdd', 'MobilenetV1/displacement_bwd_2/BiasAdd'];

function nameOutputResultsMobileNet(results) {
  const [offsets, heatmap, displacementFwd, displacementBwd] = results;
  return { offsets, heatmap, displacementFwd, displacementBwd };
}

export class BaseModel {
  model: any;
  inputSize: number;
  constructor(model) {
    this.model = model;
    this.inputSize = model.inputs[0].shape[1];
  }

  predict(input) {
    return tf.tidy(() => {
      const resized = input.resizeBilinear([this.inputSize, this.inputSize]);
      const normalized = resized.toFloat().div(127.5).sub(1.0);
      // const asBatch = asFloat.expandDims(0);
      const results = this.model.execute(normalized, poseNetOutputs);
      const results3d = results.map((y) => y.squeeze([0]));
      const namedResults = nameOutputResultsMobileNet(results3d);
      return {
        heatmapScores: namedResults.heatmap.sigmoid(),
        offsets: namedResults.offsets,
        displacementFwd: namedResults.displacementFwd,
        displacementBwd: namedResults.displacementBwd,
      };
    });
  }

  dispose() {
    this.model.dispose();
  }
}
