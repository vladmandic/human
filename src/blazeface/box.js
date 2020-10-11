const tf = require('@tensorflow/tfjs');

exports.disposeBox = (box) => {
  box.startEndTensor.dispose();
  box.startPoint.dispose();
  box.endPoint.dispose();
};

exports.createBox = (startEndTensor) => ({
  startEndTensor,
  startPoint: tf.slice(startEndTensor, [0, 0], [-1, 2]),
  endPoint: tf.slice(startEndTensor, [0, 2], [-1, 2]),
});

exports.scaleBox = (box, factors) => {
  const starts = tf.mul(box.startPoint, factors);
  const ends = tf.mul(box.endPoint, factors);
  const newCoordinates = tf.concat2d([starts, ends], 1);
  return exports.createBox(newCoordinates);
};
