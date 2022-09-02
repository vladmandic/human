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

- Update **TFJS** to **3.20.0**
- Update **TypeScript** to **4.8**
- Add **InsightFace** model as alternative for face embedding/descriptor detection  
  Compatible with multiple variations of **InsightFace** models  
  Configurable using `config.face.insightface` config section  
  See `demo/faceid/index.ts` for usage  
  Models can be downloaded from <https://github.com/vladmandic/insightface>  
- Add `human.check()` which validates all kernel ops for currently loaded models with currently selected backend  
  Example: `console.error(human.check());`  
- Add `config.softwareKernels` config option which uses **CPU** implementation for missing ops  
  Disabled by default  
  If enabled, it is used by face and hand rotation correction (`config.face.rotation` and `config.hand.rotation`)  
- Add underlying **tensorflow** library version detection when running in NodeJS to  
  `human.env` and check if **GPU** is used for acceleration  
  Example: `console.log(human.env.tensorflow)`  
- Treat models that cannot be found & loaded as non-critical error  
  Instead of creating runtime exception, `human` will now report that model could not be loaded  
- Improve `human.reset()` method to reset all config values to defaults
- Host models in <https://github.com/vladmandic/human-models>  
  Models can be directly used without downloading to local storage  
  Example: `modelBasePath: 'https://vladmandic.github.io/human-models/models/'`  
- Allow hosting models in **Google Cloud Bucket**  
  Hosted models can be directly used without downloading to local storage  
  Example: `modelBasePath: 'https://storage.googleapis.com/human-models/'`  
- Stricter linting rules for both **TypeScript** and **JavaScript**  
  See `./eslintrc.json` for details  
- Enhanced type safety across entire library  
- Fix **MobileFaceNet** model as alternative for face embedding/descriptor detection  
  Configurable using `config.face.mobilefacenet` config section  
- Fix **EfficientPose** module as alternative body detection  
- Fix **NanoDet** module as alternative object detection  
- Fix `demo/multithread/node-multiprocess.js` demo  
- Fix `human.match` when using mixed descriptor lengths  
- Fix **WASM** feature detection issue in TFJS with Edge/Chromium  
  Example: `console.log(human.env.wasm)`  
- Reorganized init & load order for faster library startup
- Increased **NodeJS** test coverage  
  Run using: `npm run test`  
  Runs tests for `tfjs-node`, `tfjs-node-gpu` and `wasm`  
- Increased **Browser** test coverage  
  Run using: `demo/browser.html`  
  Runs tests for `webgl`, `humangl`, `webgpu` and `wasm`  
  Runs tests for ESM and IIFE versions of library  
- Increase availability of alternative models  
  See `models/model.json` for full list  
- Update profiling methods in `human.profile()`  
- Update project dependencies to latest versions  
