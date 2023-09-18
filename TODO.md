# To-Do list for Human library

## Work-in-Progress

<hr><br>

## Known Issues & Limitations

### Face with Attention

`FaceMesh-Attention` is not supported when using `WASM` backend due to missing kernel op in **TFJS**  
No issues with default model `FaceMesh`  

### Object Detection

`NanoDet` model is not supported when using `WASM` backend due to missing kernel op in **TFJS**  
No issues with default model `MB3-CenterNet`  

## Body Detection using MoveNet-MultiPose

Model does not return valid detection scores (all other functionality is not impacted)  

### Firefox

Running in **web workers** requires `OffscreenCanvas` which is still disabled by default in **Firefox**  
Enable via `about:config` -> `gfx.offscreencanvas.enabled`  
[Details](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas#browser_compatibility)  

### Safari

No support for running in **web workers** as Safari still does not support `OffscreenCanvas`  
[Details](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas#browser_compatibility)  

## React-Native

`Human` support for **React-Native** is best-effort, but not part of the main development focus  

<hr><br>
