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

`FaceMesh-Attention` is not supported in `Node` or in browser using `WASM` backend due to missing kernel op in **TFJS**  
Model is supported using `WebGL` backend in browser

### WebGPU

Experimental support only until support is officially added in Chromium  
Enable via <chrome://flags/#enable-unsafe-webgpu>

### Firefox

Running in **web workers** requires `OffscreenCanvas` which is still disabled by default in **Firefox**  
Enable via `about:config` -> `gfx.offscreencanvas.enabled`

### Face Detection & Hand Detection

Enhanced rotation correction for face detection and hand detection is not working in **NodeJS** due to missing kernel op in **TFJS**  
Feature is automatically disabled in **NodeJS** without user impact  

### Object Detection

`NanoDet` model is not supported in `Node` or in browser using `WASM` backend due to missing kernel op in **TFJS**
Model is supported using `WebGL` backend in browser

<hr><br>

## Pending Release Changes

- Add **InsightFace** model as alternative for face embedding/descriptor detection  
  Compatible with multiple variations of **InsightFace** models  
  Configurable using `config.face.insightface` config section  
  See `demo/faceid/index.ts` for usage  
  Models can be downloaded from <https://github.com/vladmandic/insightface>  
- Add `human.check()` which validates all kernel ops for currently loaded models with currently selected backend  
  Example: `console.error(human.check());`  
- Host models in <human-models>  
  Models can be directly used without downloading to local storage  
  Example: `modelPath: 'https://vladmandic.github.io/human-models/models/facemesh.json'`  
- Host models in **Google Cloud Bucket**  
  Models can be directly used without downloading to local storage  
  Example: `modelPath: 'https://storage.googleapis.com/human-models/facemesh.json'`  
- Fix **MobileFaceNet** model as alternative for face embedding/descriptor detection  
  Configurable using `config.face.mobilefacenet` config section  
- Fix **EfficientPose** module as alternative body detection  
- Fix **NanoDet** module as alternative object detection  
- Fix `demo/multithread/node-multiprocess.js` demo  
- Fix `human.match` when using mixed descriptor lengths  
- Increased test coverage   
  Run using `npm run test`  
- Increase availability of alternative models  
  See `models/model.json` for full list
- Update **NMS** methods resulting in some performance improvements
- Update profiling methods in `human.profile()`  
- Update project dependencies  
