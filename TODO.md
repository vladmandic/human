# To-Do list for Human library

## Work in Progress

<br>

### Exploring

- Optical Flow: <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- Histogram Equalization: Regular, Adaptive, Contrast Limited, CLAHE
- TFLite Models: <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>
- Body segmentation: `robust-video-matting`
- TFJS incompatibility with latest `long.js` 5.0.0 due to CJS to ESM switch

<br><hr><br>

## Known Issues

#### WebGPU

Experimental support only until support is officially added in Chromium
- Performance issues:
  <https://github.com/tensorflow/tfjs/issues/5689>

### Face Detection

Enhanced rotation correction for face detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  

### Body Detection

MoveNet MultiPose model does not work with WASM backend due to missing F32 broadcast implementation

- Backend WASM missing F32 broadcat implementation  
  <https://github.com/tensorflow/tfjs/issues/5516>  

<br><hr><br>

### Pending release

New:
- New frame change detection algorithm used for [cache determination](https://vladmandic.github.io/human/typedoc/interfaces/Config.html#cacheSensitivity)  
  based on temporal input difference  
- New built-in Tensorflow profiling [human.profile](https://vladmandic.github.io/human/typedoc/classes/Human.html#profile)
- New optional input histogram equalization [config.filter.equalization](https://vladmandic.github.io/human/)  
  auto-level input for optimal brightness/contrast
- New event-baseed interface [human.events](https://vladmandic.github.io/human/typedoc/classes/Human.html#events)  
- New configuration validation [human.validate](https://vladmandic.github.io/human/typedoc/classes/Human.html#validate)  
- New input compare function [human.compare](https://vladmandic.github.io/human/typedoc/classes/Human.html#compare)  
  this function is internally used by `human` to determine frame changes and cache validation  
- New [custom built TFJS](https://github.com/vladmandic/tfjs) for bundled version  
  result is a pure module with reduced bundle size and include built-in support for all backends  
  note: **nobundle** and **node** versions link to standard `@tensorflow` packages  

Changed:
- [Default configuration values](https://github.com/vladmandic/human/blob/main/src/config.ts#L262) have been tuned for precision and performance
- Supports all built-in modules on all backends  
  via custom implementation of missing kernel ops  
- Performance and precision improvements  
  - **face**, **hand**
  - **gestures** modules  
  - **face matching**
- Fix **ReactJS** compatibility  
- Better precision using **WASM**  
  Previous issues due to math low-precision in WASM implementation  
- Full **TS** type definitions for all modules and imports  
- Focus on simplified demo  
  <https://vladmandic.github.io/human/demo/typescript/>  
