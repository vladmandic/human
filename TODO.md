# To-Do list for Human library

## Work in Progress

<br>

### Models

#### Hand

- Evaluate and switch default default model from `handdetect` to `handtrack`

#### Face

- Reimplement `BlazeFace`, `FaceMesh`, `Iris` with new pipeline and frame caching

<br>

### Backends

#### WebGL
- Optimize shader packing for WebGL backend:  
  <https://github.com/tensorflow/tfjs/issues/5343>  

#### WASM

- Backend WASM incorrect handling of `int32` tensors  
  <https://github.com/tensorflow/tfjs/issues/5641>

#### WebGPU

Implementation of WebGPU backend  
Experimental support only until support is officially added in Chromium

- Evaluate WGSL vs GLSL for WebGPU  
- Backend WebGPU missing kernel ops
  <https://github.com/tensorflow/tfjs/issues/5496>
- Backend WebGPU incompatible with web workers
  <https://github.com/tensorflow/tfjs/issues/5467>
- Backend WebGPU incompatible with sync read calls
  <https://github.com/tensorflow/tfjs/issues/5468>


<br>

### Exploring

- Optical Flow: <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- TFLite Models: <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>

<br><hr><br>

## Known Issues

<br>

### Face Detection

Enhanced rotation correction for face detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  

### Hand Detection

Enhanced rotation correction for hand detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  

### Body Detection

MoveNet MultiPose model does not work with WASM backend due to missing F32 broadcast implementation

- Backend WASM missing F32 broadcat implementation  
  <https://github.com/tensorflow/tfjs/issues/5516>  

### Object Detection

Object detection using CenterNet or NanoDet models is not working when using WASM backend due to missing kernel ops in TFJS  

- Backend WASM missing kernel op `Mod`  
  <https://github.com/tensorflow/tfjs/issues/5110>  
- Backend WASM missing kernel op `SparseToDense`  
  <https://github.com/tensorflow/tfjs/issues/4824>  
