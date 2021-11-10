# Human Demos for NodeJS

- `node`: Process images from files, folders or URLs  
  uses native methods for image loading and decoding without external dependencies  
- `node-canvas`: Process image from file or URL and draw results to a new image file using `node-canvas`  
  uses `node-canvas` library to load and decode images from files, draw detection results and write output to a new image file
- `node-video`: Processing of video input using `ffmpeg`  
  uses `ffmpeg` to decode video input (can be a file, stream or device such as webcam) and  
  output results in a pipe that are captured by demo app as frames and processed by `Human` library
- `node-webcam`: Processing of webcam screenshots using `fswebcam`  
  uses `fswebcam` to connect to web cam and take screenshots at regular interval which are then processed by `Human` library
- `node-event`: Showcases usage of `Human` eventing to get notifications on processing
- `node-similarity`: Compares two input images for similarity of detected faces
- `process-folder`: Processing all images in input folder and creates output images  
  interally used to generate samples gallery  

<br>

## Main Demo

`nodejs/node.js`: Demo using NodeJS with CommonJS module  
Simple demo that can process any input image

Note that you can run demo as-is and it will perform detection on provided sample images,  
or you can pass a path to image to analyze, either on local filesystem or using URL

```shell
node demo/nodejs/node.js
```

```json
2021-06-01 08:52:15 INFO:  @vladmandic/human version 2.0.0
2021-06-01 08:52:15 INFO:  User: vlado Platform: linux Arch: x64 Node: v16.0.0
2021-06-01 08:52:15 INFO:  Current folder: /home/vlado/dev/human
2021-06-01 08:52:15 INFO:  Human: 2.0.0
2021-06-01 08:52:15 INFO:  Active Configuration {
  backend: 'tensorflow',
  modelBasePath: 'file://models/',
  wasmPath: '../node_modules/@tensorflow/tfjs-backend-wasm/dist/',
  debug: true,
  async: false,
  warmup: 'full',
  cacheSensitivity: 0.75,
  filter: {
    enabled: true,
    width: 0,
    height: 0,
    flip: true,
    return: true,
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    blur: 0,
    saturation: 0,
    hue: 0,
    negative: false,
    sepia: false,
    vintage: false,
    kodachrome: false,
    technicolor: false,
    polaroid: false,
    pixelate: 0
  },
  gesture: { enabled: true },
  face: {
    enabled: true,
    detector: { modelPath: 'blazeface.json', rotation: false, maxDetected: 10, skipFrames: 15, minConfidence: 0.2, iouThreshold: 0.1, return: false, enabled: true },
    mesh: { enabled: true, modelPath: 'facemesh.json' },
    iris: { enabled: true, modelPath: 'iris.json' },
    description: { enabled: true, modelPath: 'faceres.json', skipFrames: 16, minConfidence: 0.1 },
    emotion: { enabled: true, minConfidence: 0.1, skipFrames: 17, modelPath: 'emotion.json' }
  },
  body: { enabled: true, modelPath: 'movenet-lightning.json', maxDetected: 1, minConfidence: 0.2 },
  hand: {
    enabled: true,
    rotation: true,
    skipFrames: 18,
    minConfidence: 0.1,
    iouThreshold: 0.1,
    maxDetected: 2,
    landmarks: true,
    detector: { modelPath: 'handdetect.json' },
    skeleton: { modelPath: 'handskeleton.json' }
  },
  object: { enabled: true, modelPath: 'mb3-centernet.json', minConfidence: 0.2, iouThreshold: 0.4, maxDetected: 10, skipFrames: 19 }
}
08:52:15.673 Human: version: 2.0.0
08:52:15.674 Human: tfjs version: 3.6.0
08:52:15.674 Human: platform: linux x64
08:52:15.674 Human: agent: NodeJS v16.0.0
08:52:15.674 Human: setting backend: tensorflow
08:52:15.710 Human: load model: file://models/blazeface.json
08:52:15.743 Human: load model: file://models/facemesh.json
08:52:15.744 Human: load model: file://models/iris.json
08:52:15.760 Human: load model: file://models/emotion.json
08:52:15.847 Human: load model: file://models/handdetect.json
08:52:15.847 Human: load model: file://models/handskeleton.json
08:52:15.914 Human: load model: file://models/movenet-lightning.json
08:52:15.957 Human: load model: file://models/mb3-centernet.json
08:52:16.015 Human: load model: file://models/faceres.json
08:52:16.015 Human: tf engine state: 50796152 bytes 1318 tensors
2021-06-01 08:52:16 INFO:  Loaded: [ 'face', 'movenet', 'handpose', 'emotion', 'centernet', 'faceres', [length]: 6 ]
2021-06-01 08:52:16 INFO:  Memory state: { unreliable: true, numTensors: 1318, numDataBuffers: 1318, numBytes: 50796152 }
2021-06-01 08:52:16 INFO:  Loading image: private/daz3d/daz3d-kiaria-02.jpg
2021-06-01 08:52:16 STATE: Processing: [ 1, 1300, 1000, 3, [length]: 4 ]
2021-06-01 08:52:17 DATA:  Results:
2021-06-01 08:52:17 DATA:    Face: #0 boxScore:0.88 faceScore:1 age:16.3 genderScore:0.97 gender:female emotionScore:0.85 emotion:happy iris:61.05
2021-06-01 08:52:17 DATA:    Body: #0 score:0.82 keypoints:17
2021-06-01 08:52:17 DATA:    Hand: #0 score:0.89
2021-06-01 08:52:17 DATA:    Hand: #1 score:0.97
2021-06-01 08:52:17 DATA:    Gesture: face#0 gesture:facing left
2021-06-01 08:52:17 DATA:    Gesture: body#0 gesture:leaning right
2021-06-01 08:52:17 DATA:    Gesture: hand#0 gesture:pinky forward middlefinger up
2021-06-01 08:52:17 DATA:    Gesture: hand#1 gesture:pinky forward middlefinger up
2021-06-01 08:52:17 DATA:    Gesture: iris#0 gesture:looking left
2021-06-01 08:52:17 DATA:    Object: #0 score:0.55 label:person
2021-06-01 08:52:17 DATA:    Object: #1 score:0.23 label:bottle
2021-06-01 08:52:17 DATA:  Persons:
2021-06-01 08:52:17 DATA:    #0: Face:score:1 age:16.3 gender:female iris:61.05 Body:score:0.82 keypoints:17 LeftHand:no RightHand:yes Gestures:4
```
