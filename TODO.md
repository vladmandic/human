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

- New methods [`human.webcam.*`](https://vladmandic.github.io/human/typedoc/classes/WebCam.html)  
  Enables built-in configuration and control of **WebCam** streams  
- New method [`human.video()`](https://vladmandic.github.io/human/typedoc/classes/Human.html#video)  
  Runs continous detection of an input **video**  
  instead of processing each frame manually using `human.detect()`  
- New demo for **webcam** and **video** methods [*Live*](https://vladmandic.github.io/human/demo/video/index.html) | [*Code*](https://github.com/vladmandic/human/blob/main/demo/video/index.html)  
  *Full HTML and JavaScript code in less than a screen*  
- Redesigned [`human.segmentation`](https://vladmandic.github.io/human/typedoc/classes/Human.html#segmentation)  
  *Breaking changes*  
- New model `rvm` for high-quality body segmentation in real-time  
  *Not part of default deployment, download from [human-models](https://github.com/vladmandic/human-models/tree/main/models)*  
- New demo for **segmentation** methods [*Live*](https://vladmandic.github.io/human/demo/segmentation/index.html) | [*Code*](https://github.com/vladmandic/human/blob/main/demo/segmentation/index.html)  
  *Full HTML and JavaScript code in less than a screen*  
- New advanced demo using **BabylonJS and VRM** [*Live*](https://vladmandic.github.io/human-bjs-vrm) | [*Code*](https://github.com/vladmandic/human-bjs-vrm)
- Update **TypeDoc** generation [*Link*](https://vladmandic.github.io/human/typedoc)  
- Update **TypeDefs** bundle generation [*Link*](https://github.com/vladmandic/human/blob/main/types/human.d.ts)  
  No external dependencies  
- Fix model caching when using web workers  
- Fix `face.rotation` when using interpolation  
- Improve NodeJS resolver when using ESM  
- Update demo `demo/typescript`  
- Update demo `demo/faceid`  
- Update demo `demo/nodejs/process-folder.js`  
  and re-process `/samples` [*Link*](https://vladmandic.github.io/human/samples)  
