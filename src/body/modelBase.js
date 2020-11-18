import * as tf from '../../dist/tfjs.esm.js';

class BaseModel {
  constructor(model, outputStride) {
    this.model = model;
    this.outputStride = outputStride;
  }

  predict(input) {
    return tf.tidy(() => {
      const asFloat = this.preprocessInput(input.toFloat());
      const asBatch = asFloat.expandDims(0);
      const results = this.model.predict(asBatch);
      const results3d = results.map((y) => y.squeeze([0]));
      const namedResults = this.nameOutputResults(results3d);
      return {
        heatmapScores: namedResults.heatmap.sigmoid(),
        offsets: namedResults.offsets,
        displacementFwd: namedResults.displacementFwd,
        displacementBwd: namedResults.displacementBwd,
      };
    });
  }

  /**
     * Releases the CPU and GPU memory allocated by the model.
     */
  dispose() {
    this.model.dispose();
  }
}
exports.BaseModel = BaseModel;
