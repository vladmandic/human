export default {
  face: {
    enabled: true, // refers to detector, but since all other face modules rely on detector, it should be a global
    detector: {
      modelPath: '/models/blazeface/model.json',
      inputSize: 128, // fixed value
      maxFaces: 10, // maximum number of faces detected in the input, should be set to the minimum number for performance
      skipFrames: 5, // how many frames to go without running the bounding box detector, only relevant if maxFaces > 1
      minConfidence: 0.8, // threshold for discarding a prediction
      iouThreshold: 0.3, // threshold for deciding whether boxes overlap too much in non-maximum suppression, must be between [0, 1]
      scoreThreshold: 0.75, // threshold for deciding when to remove boxes based on score in non-maximum suppression
    },
    mesh: {
      enabled: true,
      modelPath: '/models/facemesh/model.json',
      inputSize: 192, // fixed value
    },
    iris: {
      enabled: true,
      modelPath: '/models/iris/model.json',
      inputSize: 192, // fixed value
    },
    age: {
      enabled: true,
      modelPath: '/models/ssrnet-age/imdb/model.json',
      inputSize: 64, // fixed value
      skipFrames: 5,
    },
    gender: {
      enabled: true,
      modelPath: '/models/ssrnet-gender/imdb/model.json',
    },
  },
  body: {
    enabled: true,
    modelPath: '/models/posenet/model.json',
    inputResolution: 257, // fixed value
    outputStride: 16, // fixed value
    maxDetections: 5,
    scoreThreshold: 0.75,
    nmsRadius: 20,
  },
  hand: {
    enabled: true,
    inputSize: 256, // fixed value
    skipFrames: 5,
    minConfidence: 0.8,
    iouThreshold: 0.3,
    scoreThreshold: 0.75,
    detector: {
      anchors: '/models/handdetect/anchors.json',
      modelPath: '/models/handdetect/model.json',
    },
    skeleton: {
      modelPath: '/models/handskeleton/model.json',
    },
  },
};
