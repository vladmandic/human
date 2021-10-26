# To-Do list for Human library

## Work in Progress

- Switch to custom `tfjs` for main `human` ESM bundle

<br>

### Exploring

- Optical Flow: <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- Histogram Equalization: Regular, Adaptive, Contrast Limited
- TFLite Models: <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>
- Body segmentation: `robust-video-matting`

#### WebGPU

Experimental support only until support is officially added in Chromium
- Performance issues:
  <https://github.com/tensorflow/tfjs/issues/5689>

<br><hr><br>

## Known Issues

- `tfjs.esm.d.ts` missing namespace `OptimizerConstructors`
- exports from `match` are marked as private

<br>

### Face Detection

Enhanced rotation correction for face detection is not working in NodeJS due to missing kernel op in TFJS  
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

<br><hr><br>
