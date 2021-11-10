# Human Library: Models

For details see Wiki:

- [**List of Models & Credits**](https://github.com/vladmandic/human/wiki/Models)

## Model signatures:

```js
INFO:  graph model: /home/vlado/dev/human/models/iris.json
INFO:  created on: 2020-10-12T18:46:47.060Z
INFO:  metadata: { generatedBy: 'https://github.com/google/mediapipe', convertedBy: 'https://github.com/vladmandic', version: undefined }
INFO:  model inputs based on signature
 { name: 'input_1:0', dtype: 'DT_FLOAT', shape: [ -1, 64, 64, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'Identity:0', dytpe: 'DT_FLOAT', shape: [ -1, 1, 1, 228 ] }
INFO:  tensors: 191
DATA:  weights: {
  files: [ 'iris.bin' ],
  size: { disk: 2599092, memory: 2599092 },
  count: { total: 191, float32: 189, int32: 2 },
  quantized: { none: 191 },
  values: { total: 649773, float32: 649764, int32: 9 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder', 'Identity' ],
  convolution: [ '_FusedConv2D', 'DepthwiseConv2dNative', 'MaxPool' ],
  arithmetic: [ 'AddV2' ],
  basic_math: [ 'Prelu' ],
  transformation: [ 'Pad' ],
  slice_join: [ 'ConcatV2' ]
}
INFO:  graph model: /home/vlado/dev/human/models/facemesh.json
INFO:  created on: 2020-10-12T18:46:46.944Z
INFO:  metadata: { generatedBy: 'https://github.com/google/mediapipe', convertedBy: 'https://github.com/vladmandic', version: undefined }
INFO:  model inputs based on signature
 { name: 'input_1:0', dtype: 'DT_FLOAT', shape: [ 1, 192, 192, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'Identity_1:0', dytpe: 'DT_FLOAT', shape: [ 1, 266 ] }
 { id: 1, name: 'Identity_2:0', dytpe: 'DT_FLOAT', shape: [ 1, 1 ] }
 { id: 2, name: 'Identity:0', dytpe: 'DT_FLOAT', shape: [ 1, 1404 ] }
INFO:  tensors: 118
DATA:  weights: {
  files: [ 'facemesh.bin' ],
  size: { disk: 2955780, memory: 2955780 },
  count: { total: 118, float32: 114, int32: 4 },
  quantized: { none: 118 },
  values: { total: 738945, float32: 738919, int32: 26 }
}
DATA:  kernel ops: {
  graph: [ 'Placeholder', 'Const', 'NoOp', 'Identity' ],
  convolution: [ '_FusedConv2D', 'DepthwiseConv2dNative', 'MaxPool' ],
  arithmetic: [ 'AddV2' ],
  basic_math: [ 'Prelu', 'Sigmoid' ],
  transformation: [ 'Pad', 'Reshape' ]
}
INFO:  graph model: /home/vlado/dev/human/models/emotion.json
INFO:  created on: 2020-11-05T20:11:29.740Z
INFO:  metadata: { generatedBy: 'https://github.com/oarriaga/face_classification', convertedBy: 'https://github.com/vladmandic', version: undefined }
INFO:  model inputs based on signature
 { name: 'input_1:0', dtype: 'DT_FLOAT', shape: [ -1, 64, 64, 1 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'Identity:0', dytpe: 'DT_FLOAT', shape: [ -1, 7 ] }
INFO:  tensors: 23
DATA:  weights: {
  files: [ 'emotion.bin' ],
  size: { disk: 820516, memory: 820516 },
  count: { total: 23, float32: 22, int32: 1 },
  quantized: { none: 23 },
  values: { total: 205129, float32: 205127, int32: 2 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder', 'Identity' ],
  convolution: [ '_FusedConv2D', 'DepthwiseConv2dNative', 'MaxPool' ],
  arithmetic: [ 'AddV2' ],
  basic_math: [ 'Relu' ],
  reduction: [ 'Mean' ],
  normalization: [ 'Softmax' ]
}
INFO:  graph model: /home/vlado/dev/human/models/faceres.json
INFO:  created on: 2021-03-21T14:12:59.863Z
INFO:  metadata: { generatedBy: 'https://github.com/HSE-asavchenko/HSE_FaceRec_tf', convertedBy: 'https://github.com/vladmandic', version: undefined }
INFO:  model inputs based on signature
 { name: 'input_1', dtype: 'DT_FLOAT', shape: [ -1, 224, 224, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'gender_pred/Sigmoid:0', dytpe: 'DT_FLOAT', shape: [ 1, 1 ] }
 { id: 1, name: 'global_pooling/Mean', dytpe: 'DT_FLOAT', shape: [ 1, 1024 ] }
 { id: 2, name: 'age_pred/Softmax:0', dytpe: 'DT_FLOAT', shape: [ 1, 100 ] }
INFO:  tensors: 128
DATA:  weights: {
  files: [ 'faceres.bin' ],
  size: { disk: 6978814, memory: 13957620 },
  count: { total: 128, float32: 127, int32: 1 },
  quantized: { float16: 127, none: 1 },
  values: { total: 3489405, float32: 3489403, int32: 2 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder' ],
  convolution: [ 'Conv2D', 'DepthwiseConv2dNative' ],
  arithmetic: [ 'Add', 'Minimum', 'Maximum', 'Mul' ],
  basic_math: [ 'Relu', 'Sigmoid' ],
  reduction: [ 'Mean' ],
  matrices: [ '_FusedMatMul' ],
  normalization: [ 'Softmax' ]
}
INFO:  graph model: /home/vlado/dev/human/models/blazeface.json
INFO:  created on: 2020-10-15T19:57:26.419Z
INFO:  metadata: { generatedBy: 'https://github.com/google/mediapipe', convertedBy: 'https://github.com/vladmandic', version: undefined }
INFO:  model inputs based on signature
 { name: 'input:0', dtype: 'DT_FLOAT', shape: [ 1, 256, 256, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'Identity_3:0', dytpe: 'DT_FLOAT', shape: [ 1, 384, 16 ] }
 { id: 1, name: 'Identity:0', dytpe: 'DT_FLOAT', shape: [ 1, 512, 1 ] }
 { id: 2, name: 'Identity_1:0', dytpe: 'DT_FLOAT', shape: [ 1, 384, 1 ] }
 { id: 3, name: 'Identity_2:0', dytpe: 'DT_FLOAT', shape: [ 1, 512, 16 ] }
INFO:  tensors: 112
DATA:  weights: {
  files: [ 'blazeface.bin' ],
  size: { disk: 538928, memory: 538928 },
  count: { total: 112, float32: 106, int32: 6 },
  quantized: { none: 112 },
  values: { total: 134732, float32: 134704, int32: 28 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder', 'Identity' ],
  convolution: [ '_FusedConv2D', 'DepthwiseConv2dNative', 'MaxPool' ],
  arithmetic: [ 'AddV2' ],
  basic_math: [ 'Relu' ],
  transformation: [ 'Pad', 'Reshape' ]
}
INFO:  graph model: /home/vlado/dev/human/models/mb3-centernet.json
INFO:  created on: 2021-05-19T11:50:13.013Z
INFO:  metadata: { generatedBy: 'https://github.com/610265158/mobilenetv3_centernet', convertedBy: 'https://github.com/vladmandic', version: undefined }
INFO:  model inputs based on signature
 { name: 'tower_0/images', dtype: 'DT_FLOAT', shape: [ 1, 512, 512, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'tower_0/wh', dytpe: 'DT_FLOAT', shape: [ 1, 128, 128, 4 ] }
 { id: 1, name: 'tower_0/keypoints', dytpe: 'DT_FLOAT', shape: [ 1, 128, 128, 80 ] }
 { id: 2, name: 'tower_0/detections', dytpe: 'DT_FLOAT', shape: [ 1, 100, 6 ] }
INFO:  tensors: 267
DATA:  weights: {
  files: [ 'mb3-centernet.bin' ],
  size: { disk: 4030290, memory: 8060260 },
  count: { total: 267, float32: 227, int32: 40 },
  quantized: { float16: 227, none: 40 },
  values: { total: 2015065, float32: 2014985, int32: 80 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder', 'Identity' ],
  convolution: [ '_FusedConv2D', 'FusedDepthwiseConv2dNative', 'DepthwiseConv2dNative', 'Conv2D', 'MaxPool' ],
  arithmetic: [ 'Mul', 'Add', 'FloorDiv', 'FloorMod', 'Sub' ],
  basic_math: [ 'Relu6', 'Relu', 'Sigmoid' ],
  reduction: [ 'Mean' ],
  image: [ 'ResizeBilinear' ],
  slice_join: [ 'ConcatV2', 'GatherV2', 'StridedSlice' ],
  transformation: [ 'Reshape', 'Cast', 'ExpandDims' ],
  logical: [ 'Equal' ],
  evaluation: [ 'TopKV2' ]
}
INFO:  graph model: /home/vlado/dev/human/models/movenet-lightning.json
INFO:  created on: 2021-05-29T12:26:32.994Z
INFO:  metadata: { generatedBy: 'https://tfhub.dev/google/movenet/singlepose/lightning/4', convertedBy: 'https://github.com/vladmandic', version: undefined }
INFO:  model inputs based on signature
 { name: 'input:0', dtype: 'DT_INT32', shape: [ 1, 192, 192, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'Identity:0', dytpe: 'DT_FLOAT', shape: [ 1, 1, 17, 3 ] }
INFO:  tensors: 180
DATA:  weights: {
  files: [ 'movenet-lightning.bin' ],
  size: { disk: 4650216, memory: 9300008 },
  count: { total: 180, int32: 31, float32: 149 },
  quantized: { none: 31, float16: 149 },
  values: { total: 2325002, int32: 106, float32: 2324896 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder', 'Identity' ],
  transformation: [ 'Cast', 'ExpandDims', 'Squeeze', 'Reshape' ],
  slice_join: [ 'Unpack', 'Pack', 'GatherNd', 'ConcatV2' ],
  arithmetic: [ 'Sub', 'Mul', 'AddV2', 'FloorDiv', 'SquaredDifference', 'RealDiv' ],
  convolution: [ '_FusedConv2D', 'FusedDepthwiseConv2dNative', 'DepthwiseConv2dNative' ],
  image: [ 'ResizeBilinear' ],
  basic_math: [ 'Sigmoid', 'Sqrt' ],
  reduction: [ 'ArgMax' ]
}
INFO:  graph model: /home/vlado/dev/human/models/selfie.json
INFO:  created on: 2021-06-04T13:46:56.904Z
INFO:  metadata: { generatedBy: 'https://github.com/PINTO0309/PINTO_model_zoo/tree/main/109_Selfie_Segmentation', convertedBy: 'https://github.com/vladmandic', version: '561.undefined' }
INFO:  model inputs based on signature
 { name: 'input_1:0', dtype: 'DT_FLOAT', shape: [ 1, 256, 256, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'activation_10:0', dytpe: 'DT_FLOAT', shape: [ 1, 256, 256, 1 ] }
INFO:  tensors: 136
DATA:  weights: {
  files: [ 'selfie.bin' ],
  size: { disk: 212886, memory: 425732 },
  count: { total: 136, int32: 4, float32: 132 },
  quantized: { none: 4, float16: 132 },
  values: { total: 106433, int32: 10, float32: 106423 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder' ],
  convolution: [ 'Conv2D', 'DepthwiseConv2dNative', 'AvgPool', 'Conv2DBackpropInput' ],
  arithmetic: [ 'Add', 'Mul', 'AddV2', 'AddN' ],
  basic_math: [ 'Relu6', 'Relu', 'Sigmoid' ],
  image: [ 'ResizeBilinear' ]
}
INFO:  graph model: /home/vlado/dev/human/models/handtrack.json
INFO:  created on: 2021-09-21T12:09:47.583Z
INFO:  metadata: { generatedBy: 'https://github.com/victordibia/handtracking', convertedBy: 'https://github.com/vladmandic', version: '561.undefined' }
INFO:  model inputs based on signature
 { name: 'input_tensor:0', dtype: 'DT_UINT8', shape: [ 1, 320, 320, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'Identity_2:0', dytpe: 'DT_FLOAT', shape: [ 1, 100 ] }
 { id: 1, name: 'Identity_4:0', dytpe: 'DT_FLOAT', shape: [ 1, 100 ] }
 { id: 2, name: 'Identity_6:0', dytpe: 'DT_FLOAT', shape: [ 1, 12804, 4 ] }
 { id: 3, name: 'Identity_1:0', dytpe: 'DT_FLOAT', shape: [ 1, 100, 4 ] }
 { id: 4, name: 'Identity_3:0', dytpe: 'DT_FLOAT', shape: [ 1, 100, 8 ] }
 { id: 5, name: 'Identity_5:0', dytpe: 'DT_FLOAT', shape: [ 1 ] }
 { id: 6, name: 'Identity:0', dytpe: 'DT_FLOAT', shape: [ 1, 100 ] }
 { id: 7, name: 'Identity_7:0', dytpe: 'DT_FLOAT', shape: [ 1, 12804, 8 ] }
INFO:  tensors: 619
DATA:  weights: {
  files: [ 'handtrack.bin' ],
  size: { disk: 2964837, memory: 11846016 },
  count: { total: 619, int32: 347, float32: 272 },
  quantized: { none: 347, uint8: 272 },
  values: { total: 2961504, int32: 1111, float32: 2960393 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder', 'Identity', 'Shape', 'NoOp' ],
  control: [ 'TensorListReserve', 'Enter', 'TensorListFromTensor', 'Merge', 'LoopCond', 'Switch', 'Exit', 'TensorListStack', 'NextIteration', 'TensorListSetItem', 'TensorListGetItem' ],
  logical: [ 'Less', 'LogicalAnd', 'Select', 'Greater', 'GreaterEqual' ],
  convolution: [ '_FusedConv2D', 'FusedDepthwiseConv2dNative', 'DepthwiseConv2dNative' ],
  arithmetic: [ 'AddV2', 'Mul', 'Sub', 'Minimum', 'Maximum' ],
  transformation: [ 'Cast', 'ExpandDims', 'Squeeze', 'Reshape', 'Pad' ],
  slice_join: [ 'Unpack', 'StridedSlice', 'Pack', 'ConcatV2', 'Slice', 'GatherV2', 'Split' ],
  image: [ 'ResizeBilinear' ],
  basic_math: [ 'Reciprocal', 'Sigmoid', 'Exp' ],
  matrices: [ 'Transpose' ],
  dynamic: [ 'NonMaxSuppressionV5', 'Where' ],
  creation: [ 'Fill', 'Range' ],
  evaluation: [ 'TopKV2' ],
  reduction: [ 'Sum' ]
}
INFO:  graph model: /home/vlado/dev/human/models/antispoof.json
INFO:  created on: 2021-10-13T14:20:27.100Z
INFO:  metadata: { generatedBy: 'https://www.kaggle.com/anku420/fake-face-detection', convertedBy: 'https://github.com/vladmandic', version: '716.undefined' }
INFO:  model inputs based on signature
 { name: 'conv2d_input', dtype: 'DT_FLOAT', shape: [ -1, 128, 128, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'activation_4', dytpe: 'DT_FLOAT', shape: [ -1, 1 ] }
INFO:  tensors: 11
DATA:  weights: {
  files: [ 'antispoof.bin' ],
  size: { disk: 853098, memory: 1706188 },
  count: { total: 11, float32: 10, int32: 1 },
  quantized: { float16: 10, none: 1 },
  values: { total: 426547, float32: 426545, int32: 2 }
}
DATA:  kernel ops: { graph: [ 'Const', 'Placeholder', 'Identity' ], convolution: [ '_FusedConv2D', 'MaxPool' ], basic_math: [ 'Relu', 'Sigmoid' ], transformation: [ 'Reshape' ], matrices: [ '_FusedMatMul' ] }
INFO:  graph model: /home/vlado/dev/human/models/handlandmark-full.json
INFO:  created on: 2021-10-31T12:27:49.343Z
INFO:  metadata: { generatedBy: 'https://github.com/google/mediapipe', convertedBy: 'https://github.com/vladmandic', version: '808.undefined' }
INFO:  model inputs based on signature
 { name: 'input_1', dtype: 'DT_FLOAT', shape: [ 1, 224, 224, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'Identity_3:0', dytpe: 'DT_FLOAT', shape: [ 1, 63 ] }
 { id: 1, name: 'Identity:0', dytpe: 'DT_FLOAT', shape: [ 1, 63 ] }
 { id: 2, name: 'Identity_1:0', dytpe: 'DT_FLOAT', shape: [ 1, 1 ] }
 { id: 3, name: 'Identity_2:0', dytpe: 'DT_FLOAT', shape: [ 1, 1 ] }
INFO:  tensors: 103
DATA:  weights: {
  files: [ 'handlandmark-full.bin' ],
  size: { disk: 5431368, memory: 10862728 },
  count: { total: 103, float32: 102, int32: 1 },
  quantized: { float16: 102, none: 1 },
  values: { total: 2715682, float32: 2715680, int32: 2 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder', 'Identity' ],
  convolution: [ 'Conv2D', 'DepthwiseConv2dNative' ],
  arithmetic: [ 'AddV2', 'AddN' ],
  basic_math: [ 'Relu6', 'Sigmoid' ],
  reduction: [ 'Mean' ],
  matrices: [ '_FusedMatMul' ]
}
INFO:  graph model: /home/vlado/dev/human/models/liveness.json
INFO:  created on: 2021-11-09T12:39:11.760Z
INFO:  metadata: { generatedBy: 'https://github.com/leokwu/livenessnet', convertedBy: 'https://github.com/vladmandic', version: '808.undefined' }
INFO:  model inputs based on signature
 { name: 'conv2d_1_input', dtype: 'DT_FLOAT', shape: [ -1, 32, 32, 3 ] }
INFO:  model outputs based on signature
 { id: 0, name: 'activation_6', dytpe: 'DT_FLOAT', shape: [ -1, 2 ] }
INFO:  tensors: 23
DATA:  weights: {
  files: [ 'liveness.bin' ],
  size: { disk: 592976, memory: 592976 },
  count: { total: 23, float32: 22, int32: 1 },
  quantized: { none: 23 },
  values: { total: 148244, float32: 148242, int32: 2 }
}
DATA:  kernel ops: {
  graph: [ 'Const', 'Placeholder', 'Identity' ],
  convolution: [ '_FusedConv2D', 'MaxPool' ],
  arithmetic: [ 'Mul', 'Add', 'AddV2' ],
  transformation: [ 'Reshape' ],
  matrices: [ '_FusedMatMul' ],
  normalization: [ 'Softmax' ]
}
```
