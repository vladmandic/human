# To-Do list for Human library

## Big Ticket Items

Implementation of WebGPU backend  
*Target: `Human` v2.3 with `Chrome` v94 and `TFJS` v4.0*

<br>

## Work in Progress

WebGL shader optimizations for faster load and initial detection

- Implement WebGL uniforms for shaders: <https://github.com/tensorflow/tfjs/issues/5205>
- Fix shader packing: <https://github.com/tensorflow/tfjs/issues/5343>

<br>

## Exploring

- Optical Flow: <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- TFLite Models: <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>

## Known Issues

### Object Detection

Object detection using CenterNet or NanoDet models is not working when using WASM backend due to missing kernel ops in TFJS  
*Target: `Human` v2.2 with `TFJS` v3.9*

- CenterNet with WASM: <https://github.com/tensorflow/tfjs/issues/5110>
- NanoDet with WASM: <https://github.com/tensorflow/tfjs/issues/4824>

### Face Detection

Enhanced rotation correction for face detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  
*Target: `Human` v2.2 with `TFJS` v3.9*

- BlazeFace rotation correction in NodeJS: <https://github.com/tensorflow/tfjs/issues/4066>

### Hand Detection

Enhanced rotation correction for hand detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  
*Target: `Human` v2.2 with `TFJS` v3.9*

- HandPose rotation correction in NodeJS: <https://github.com/tensorflow/tfjs/issues/4066>

Hand detection using WASM backend has reduced precision due to math rounding errors in backend  
*Target: N/A*
