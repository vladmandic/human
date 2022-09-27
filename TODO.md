# To-Do list for Human library

## Work-in-Progress

N/A

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

## Known Issues

### Face with Attention

`FaceMesh-Attention` is not supported in browser using `WASM` backend due to missing kernel op in **TFJS**  

### Object Detection

`NanoDet` model is not supported in in browser using `WASM` backend due to missing kernel op in **TFJS**  

### WebGPU

Experimental support only until support is officially added in Chromium  
Enable via <chrome://flags/#enable-unsafe-webgpu>

### Firefox

Running in **web workers** requires `OffscreenCanvas` which is still disabled by default in **Firefox**  
Enable via `about:config` -> `gfx.offscreencanvas.enabled`

<hr><br>

## Pending Release Changes

- New API [`human.video()`](https://vladmandic.github.io/human/typedoc/classes/Human.html#video)  
  Runs continous detection of an input video instead of processing each frame manually  
- New simple demo [*Live*](https://vladmandic.github.io/human/demo/video/index.html)  
- New advanced demo using BabylonJS <https://vladmandic.github.io/human-bjs-vrm>  
- Enable model cache when using web workers  
- Fix for `face.rotation` interpolation  
- Improve NodeJS resolver when using ESM  
- Update demo `demo/faceid`  
- Update demo `demo/nodejs/process-folder.js`  
  and re-process `/samples`  
