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

## Pending release notes:

New:
- new demo `demos/faceid` that utilizes multiple algorithm  to validate input before triggering face recognition
- new optional model `liveness`  
  checks if input appears to be a real-world live image or a recording  
  best used together with `antispoofing` that checks if input appears to have a realistic face
- new face masking option in `face.config.detector.mask`

Other:
- Improved **Safari** compatibility
- Improved `similarity` and `match` score range normalization
- Documentation overhaul
