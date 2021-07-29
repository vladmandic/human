# Test Results

## Automatic Tests

Not required for normal funcioning of library

### NodeJS using TensorFlow library

- Image filters are disabled due to lack of Canvas and WeBGL access
- Face rotation is disabled for `NodeJS` platform:  
  `Kernel 'RotateWithOffset' not registered for backend 'tensorflow'`  
  <https://github.com/tensorflow/tfjs/issues/4606>
  Work has recently been completed and will likely be included in TFJS 3.9.0

### NodeJS using WASM

- Requires dev http server  
  See <https://github.com/tensorflow/tfjs/issues/4927>
- Image filters are disabled due to lack of Canvas and WeBGL access
- Only supported input is Tensor due to missing image decoders
- Warmup returns null and is marked as failed  
  Missing image decode in `tfjs-core`
- Fails on object detection:  
  `Kernel 'SparseToDense' not registered for backend 'wasm'`  
  <https://github.com/tensorflow/tfjs/issues/4824>

<br>

## Manual Tests

### Browser using WebGL backend

- Chrome/Edge: All Passing
- Firefox: WebWorkers not supported due to missing support for OffscreenCanvas
- Safari: Limited Testing

### Browser using WASM backend

- Chrome/Edge: All Passing
- Firefox: WebWorkers not supported due to missing support for OffscreenCanvas
- Safari: Limited Testing
- Fails on object detection:  
  `Kernel 'SparseToDense' not registered for backend 'wasm'`  
  <https://github.com/tensorflow/tfjs/issues/4824>
