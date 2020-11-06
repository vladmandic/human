const tf = require('@tensorflow/tfjs');

class BaseModel {
  constructor(model, outputStride) {
    this.model = model;
    this.outputStride = outputStride;
  }

  /**
     * Predicts intermediate Tensor representations.
     *
     * @param input The input RGB image of the base model.
     * A Tensor of shape: [`inputResolution`, `inputResolution`, 3].
     *
     * @return A dictionary of base model's intermediate predictions.
     * The returned dictionary should contains the following elements:
     * heatmapScores: A Tensor3D that represents the heatmapScores.
     * offsets: A Tensor3D that represents the offsets.
     * displacementFwd: A Tensor3D that represents the forward displacement.
     * displacementBwd: A Tensor3D that represents the backward displacement.
     */
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
