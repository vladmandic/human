# To-Do list for Human library

## Work-in-Progress


<hr><br>

## Exploring

- **Optical flow** for intelligent temporal interpolation  
  <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- **CLAHE** advanced histogram equalization for optimization of badly lit scenes  
- **TFLite** models  
  <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>
- **Principal Components Analysis** for reduction of descriptor complexity  
  <https://github.com/vladmandic/human-match/blob/main/src/pca.js>  
- **Temporal guidance** for face/body segmentation  
  <https://github.com/PeterL1n/RobustVideoMatting>

<hr><br>

## Known Issues & Limitations

### Face with Attention

`FaceMesh-Attention` is not supported when using `WASM` backend due to missing kernel op in **TFJS**  
No issues with default model `FaceMesh`  

### Object Detection

`NanoDet` model is not supported when using `WASM` backend due to missing kernel op in **TFJS**  
No issues with default model `MB3-CenterNet`  

### WebGPU

Experimental support only until support is officially added in Chromium  
Enable via <chrome://flags/#enable-unsafe-webgpu>  

### Firefox

Running in **web workers** requires `OffscreenCanvas` which is still disabled by default in **Firefox**  
Enable via `about:config` -> `gfx.offscreencanvas.enabled`  
[Details](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas#browser_compatibility)  

### Safari

No support for running in **web workers** as Safari still does not support `OffscreenCanvas`  
[Details](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas#browser_compatibility)  

<hr><br>

## Pending Release Changes

