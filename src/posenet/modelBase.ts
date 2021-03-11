import * as tf from '../../dist/tfjs.esm.js';

function nameOutputResultsMobileNet(results) {
  const [offsets, heatmap, displacementFwd, displacementBwd] = results;
  return { offsets, heatmap, displacementFwd, displacementBwd };
}

export class BaseModel {
  model: any;
  constructor(model) {
    this.model = model;
  }

  predict(input) {
    return tf.tidy(() => {
      const asFloat = input.toFloat().div(127.5).sub(1.0);
      const asBatch = asFloat.expandDims(0);
      const results = this.model.predict(asBatch);
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
