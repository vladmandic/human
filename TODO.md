# To-Do list for Human library

## Work in Progress

WebGL shader optimizations for faster load and initial detection

- Implement WebGL uniforms for shaders: <https://github.com/tensorflow/tfjs/issues/5205>
- Fix shader packing: <https://github.com/tensorflow/tfjs/issues/5343>

<br>

## Exploring

- Optical Flow: <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- TFLite Models: <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>

<br>

## Known Issues

<br>

### Face Detection

Enhanced rotation correction for face detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `FlipLeftRight`  
  <https://github.com/tensorflow/tfjs/issues/4066>  
  *Target: `Human` v2.2 with `TFJS` v3.9*
- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  
  *Target: N/A*

<br>

### Hand Detection

Enhanced rotation correction for hand detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `FlipLeftRight`  
  <https://github.com/tensorflow/tfjs/issues/4066>  
  *Target: `Human` v2.2 with `TFJS` v3.9*
- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  
  *Target: N/A*

Hand detection using WASM backend has reduced precision due to math rounding errors in backend  
*Target: N/A*

<br>

### Object Detection

Object detection using CenterNet or NanoDet models is not working when using WASM backend due to missing kernel ops in TFJS  

- Backend WASM missing kernel op `Mod`  
  <https://github.com/tensorflow/tfjs/issues/5110>  
  *Target: `Human` v2.2 with `TFJS` v3.9*
- Backend WASM missing kernel op `SparseToDense`  
  <https://github.com/tensorflow/tfjs/issues/4824>  
  *Target: `Human` v2.2 with `TFJS` v3.9*

### WebGPU Backend

Implementation of WebGPU backend  
Experimental support only

*Target: `Human` v2.3 with `Chrome` v94 and `TFJS` v4.0*

<br>

- Backend WebGPU missing kernel ops
  <https://github.com/tensorflow/tfjs/issues/5496>
- Backend WebGPU incompatible with web workers
  <https://github.com/tensorflow/tfjs/issues/5467>
- Backend WebGPU incompatible with sync read calls
  <https://github.com/tensorflow/tfjs/issues/5468>
