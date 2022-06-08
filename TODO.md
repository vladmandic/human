# To-Do list for Human library

## Work-in-Progress

N/A

<hr><br>

## Exploring

- Optical flow for intelligent temporal interpolation  
  <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- Advanced histogram equalization for optimization of badly lit scenes  
  **Adaptive**, **Contrast Limited**, **CLAHE**
- TFLite models  
  <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>
- Body segmentation with temporal analysis  
  <https://github.com/PeterL1n/RobustVideoMatting>

<hr><br>

## Known Issues
### Face with Attention
`FaceMesh-Landmarks` model is supported only with `CPU` and `WebGL` backends due to `TFJS` issues

### WASM

Support for **WASM SIMD** and **WASM MultiThreading** is still disabled by default in **Chromium** based browsers  
Suggestion is to enable it manually for major performance boost  
Enable via <chrome://flags/#enable-experimental-webassembly-features>

### WebGPU

Experimental support only until support is officially added in Chromium  
Enable via <chrome://flags/#enable-unsafe-webgpu>

### Firefox

Running in **web workers** requires `OffscreenCanvas` which is still disabled by default in **Firefox**  
Enable via `about:config` -> `gfx.offscreencanvas.enabled`

### Face Detection

Enhanced rotation correction for face detection is not working in **NodeJS** due to missing kernel op in **TFJS**  
Feature is automatically disabled in **NodeJS** without user impact  

<hr><br>

## Pending Release Changes
