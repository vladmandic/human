# To-Do list for Human library

## Work in Progress

<br>

### Handtrack

- Evaluate and switch default

### Models

- Document and publish optional models

<br>

### Backends

- Optimize shader packing for WebGL backend:  
  <https://github.com/tensorflow/tfjs/issues/5343>  
- Add and benchmark WGSL for WebGPU  

<br>

### Exploring

- Optical Flow: <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- TFLite Models: <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>

<br>

## Known Issues

<br>

### Face Detection

Enhanced rotation correction for face detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  

<br>

### Face Emotion Detection

Face Emotion detection using WASM backend has reduced precision due to math errors in backend  

- Backend WASM incorrect handling of `int32` tensors  
  <https://github.com/tensorflow/tfjs/issues/5641>

<br>

### Hand Detection

Enhanced rotation correction for hand detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  

Hand detection using WASM backend has reduced precision due to math errors in backend  

- Backend WASM incorrect handling of `int32` tensors  
  <https://github.com/tensorflow/tfjs/issues/5641>

<br>

### Body Detection

MoveNet MultiPose model does not work with WASM backend due to missing F32 implementation

- Backend WASM missing F32 implementation  
  <https://github.com/tensorflow/tfjs/issues/5516>  

### Object Detection

Object detection using CenterNet or NanoDet models is not working when using WASM backend due to missing kernel ops in TFJS  

- Backend WASM missing kernel op `Mod`  
  <https://github.com/tensorflow/tfjs/issues/5110>  
- Backend WASM missing kernel op `SparseToDense`  
  <https://github.com/tensorflow/tfjs/issues/4824>  

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
