# Test Results

## Automatic Tests

Not required for normal funcioning of library

### NodeJS using TensorFlow library

- Image filters are disabled due to lack of Canvas and WebGL access
- Face rotation is disabled for `NodeJS` platform:  
  `Kernel 'RotateWithOffset' not registered for backend 'tensorflow'`  
  <https://github.com/tensorflow/tfjs/issues/4606>

### NodeJS using WASM

- Requires dev http server  
  See <https://github.com/tensorflow/tfjs/issues/4927>
- Image filters are disabled due to lack of Canvas and WeBGL access
- Only supported input is Tensor due to missing image decoders

<br>

## Browser Tests

- Chrome/Edge: **All Passing**
- Firefox: WebWorkers not supported due to missing support for `OffscreenCanvas`
- Safari: **Limited Testing**
