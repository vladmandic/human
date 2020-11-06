class ModelWeights {
  constructor(variables) {
    this.variables = variables;
  }

  weights(layerName) {
    return this.variables[`MobilenetV1/${layerName}/weights`];
  }

  depthwiseBias(layerName) {
    return this.variables[`MobilenetV1/${layerName}/biases`];
  }

  convBias(layerName) {
    return this.depthwiseBias(layerName);
  }

  depthwiseWeights(layerName) {
    return this.variables[`MobilenetV1/${layerName}/depthwise_weights`];
  }

  dispose() {
    for (const varName in this.variables) {
      this.variables[varName].dispose();
    }
  }
}
exports.ModelWeights = ModelWeights;
