# To-Do list for Human library

## Work in Progress

<br>

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

## Human 2.6 Release Notes

- Add model cache hander using **IndexDB** in *browser* environments  
  see `config.cacheModels` setting for details  
- Add additional demos  
  `human-motion` and `human-avatar`  
- Updated samples image gallery  
- Allow monkey-patching `fetch` in NodeJS  
  If `fetch` function is defined, it can be used to load models  
  from HTTP/HTTPS URLs regardless of `tfjs` platform support  
- Fix `BlazeFace` detections when face is partially occluded  
- Fix `BlazeFace` box scaling  
- Fix `HandTrack` tracking when hand is in front of face  
- Fix `ElectronJS` compatibility issues
- Fix body keypoints interpolation algorithm
- Updated `BlazePose` calculations  
- Changes to `BlazePose` and `HandLandmark` annotations  
- Strong typing for string enums  
- Updated `TFJS`  
