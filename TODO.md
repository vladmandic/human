# To-Do list for Human library

## Work in Progress

Release 2.7:
- Add **MediaPipe FaceMesh-with-Attention** model  
  model is available in `@vladmandic/human-models` repository  
  to enable, set `config.face.attention = true`  
  model replaces **iris**, **eyes** and **lips** keypoints with high-detailed ones  
- Add model **pre-compile** phase to `warmup` method
  result is speed-up to first inference by around ~30% for browser environments
- Changed default face crop from 120% to 140%  
  to better utilize caching between frames  
- Refactor **draw** methods into separate modules and fix coloring function  
- Add highlights to attention keypoints  
  enabled when both points and attention draw are enabled:  
  `human.draw.options.drawAttention = true` and `human.draw.options.drawPoints = true`
- Add **ElectronJS** demo:  
  see <https://github.com/vladmandic/human-electron>  
- Enhanced **3D** demos:  
  see <https://github.com/vladmandic/human-motion>
- Update build platform and dependencies  
- Update **TFJS**

### Exploring

- Optical flow: <https://docs.opencv.org/3.3.1/db/d7f/tutorial_js_lucas_kanade.html>
- Advanced histogram equalization: Adaptive, Contrast Limited, CLAHE
- TFLite models: <https://js.tensorflow.org/api_tflite/0.0.1-alpha.4/>
- Body segmentation: `robust-video-matting`

<br><hr><br>

## Known Issues

#### WebGPU

Experimental support only until support is officially added in Chromium

### Face Detection

Enhanced rotation correction for face detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  

<br><hr><br>

## Pending Release Notes
