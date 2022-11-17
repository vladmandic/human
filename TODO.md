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

Optimizations:
- Enabled high-resolution optimizations  
  Internal limits are increased from **2k** to **4k**
- Enhanced device capabilities detection  
  See `human.env.[agent, wasm, webgl, webgpu]` for details  
- If `config.backend` is not set, Human will auto-select best backend  
  based on device capabilities  
- Enhanced support for `webgpu`  

Features:
- Add [draw label templates](https://github.com/vladmandic/human/wiki/Draw)  
- Add `config.filter.autoBrightness` (*enabled by default*)  
  Per-frame video on-the-fly brightness adjustments  
  Which significantly increases performance and precision in poorly lit scenes  
- Improved `config.filter.equalization` (*disabled by default*)  
  Image and video on-demand histogram equalization  
- Support selecting specific video source when multiple cameras are present  
  See `human.webcam.enumerate()`  
- Updated algorithm to determine distance from camera based on iris size  
  See `human.result.face[n].distance`  

Architecture:
- Reduce build dependencies  
  `Human` is now 30% smaller :)  
  As usual, `Human` has **zero** runtime dependencies,  
  all *devDependencies* are only to rebuild `Human` itself
- Upgrade to **TFJS 4.0** with **strong typing**  
  see [notes](https://github.com/vladmandic/human#typedefs) on how to use  
- `TypeDef` refactoring  
- Add named export for improved bundler support when using non-default imports  
- Support for `NodeJS` v19  
- Upgrade to **TypeScript 4.9**  
