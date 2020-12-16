import * as tf from '../../dist/tfjs.esm.js';

const imageNetMean = [-123.15, -115.90, -103.06];

function nameOutputResultsMobileNet(results) {
  const [offsets, heatmap, displacementFwd, displacementBwd] = results;
  return { offsets, heatmap, displacementFwd, displacementBwd };
}

function nameOutputResultsResNet(results) {
  const [displacementFwd, displacementBwd, offsets, heatmap] = results;
  return { offsets, heatmap, displacementFwd, displacementBwd };
}

class BaseModel {
  constructor(model) {
    this.model = model;
  }

  predict(input, config) {
    return tf.tidy(() => {
      const asFloat = (config.body.modelType === 'ResNet') ? input.toFloat().add(imageNetMean) : input.toFloat().div(127.5).sub(1.0);
      const asBatch = asFloat.expandDims(0);
      const results = this.model.predict(asBatch);
      const results3d = results.map((y) => y.squeeze([0]));
      const namedResults = (config.body.modelType === 'ResNet') ? nameOutputResultsResNet(results3d) : nameOutputResultsMobileNet(results3d);
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
exports.BaseModel = BaseModel;
