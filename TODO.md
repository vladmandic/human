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

- Performance issues:
  <https://github.com/tensorflow/tfjs/issues/5689>

### Face Detection

Enhanced rotation correction for face detection is not working in NodeJS due to missing kernel op in TFJS  
Feature is automatically disabled in NodeJS without user impact  

- Backend NodeJS missing kernel op `RotateWithOffset`  
  <https://github.com/tensorflow/tfjs/issues/5473>  

<br><hr><br>

## Pending Release Notes

New:
- Demo `demos/faceid` that utilizes multiple algorithm  to validate input before triggering face recognition
- Type definitions rollup for `Human` and `TFJS`
- Optional module `liveness`  
  checks if input appears to be a real-world live image or a recording  
  best used together with module `antispoofing` that checks if input appears to have a realistic face
- Face masking option in `face.config.detector.mask`  
  result is shading of face image outside of face area which is useful for increased sensitivity of other modules that rely on detected face as input 
- Face crop option in `face.config.detector.cropFactor`
  result is user-definable fine-tuning for other modules that rely on detected face as input 

Other:
- Documentation overhaul
- Improved **Safari** compatibility
- Improved `similarity` and `match` score range normalization
- Improved error handling
- Improved VSCode out-of-the-box experience
- Fix for optional `gear`, `ssrnet`, `mobilefacenet` modules
- Fix for Firefox WebGPU compatibility issue
- Fix face detect box scale and rotation
- Fix body interpolation
- Updated `blazepose` implementation
- Strong typing for all string enums in `config` and `results`
