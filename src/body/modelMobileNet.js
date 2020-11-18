import * as tf from '../../dist/tfjs.esm.js';
import * as modelBase from './modelBase';

class MobileNet extends modelBase.BaseModel {
  // eslint-disable-next-line class-methods-use-this
  preprocessInput(input) {
    // Normalize the pixels [0, 255] to be between [-1, 1].
    return tf.tidy(() => tf.div(input, 127.5).sub(1.0));
  }

  // eslint-disable-next-line class-methods-use-this
  nameOutputResults(results) {
    const [offsets, heatmap, displacementFwd, displacementBwd] = results;
    return { offsets, heatmap, displacementFwd, displacementBwd };
  }
}
exports.MobileNet = MobileNet;
