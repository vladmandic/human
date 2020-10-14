# Human: 3D Face Detection, Body Pose, Hand & Finger Tracking, Iris Tracking and Age & Gender Prediction

- [**Documentation**](https://github.com/vladmandic/human#readme)
- [**Code Repository**](https://github.com/vladmandic/human)
- [**Package**](https://www.npmjs.com/package/@vladmandic/human)
- [**Issues Tracker**](https://github.com/vladmandic/human/issues)
- [**Live Demo**](https://vladmandic.github.io/human/demo/demo-esm.html)

Compatible with Browser, WebWorker and NodeJS execution!

*This is a pre-release project, see [issues](https://github.com/vladmandic/human/issues) for list of known limitations*  

*Suggestions are welcome!*

<hr>

**Example using static image:**  
![Example Using Image](demo/sample-image.jpg)

**Example using webcam:**  
![Example Using WebCam](demo/sample-video.jpg)

<hr>

## Credits

This is an amalgamation of multiple existing models:

- Face Detection: [**MediaPipe BlazeFace**](https://drive.google.com/file/d/1f39lSzU5Oq-j_OXgS67KfN5wNsoeAZ4V/view)
- Facial Spacial Geometry: [**MediaPipe FaceMesh**](https://drive.google.com/file/d/1VFC_wIpw4O7xBOiTgUldl79d9LA-LsnA/view)
- Eye Iris Details: [**MediaPipe Iris**](https://drive.google.com/file/d/1bsWbokp9AklH2ANjCfmjqEzzxO1CNbMu/view)
- Hand Detection & Skeleton: [**MediaPipe HandPose**](https://drive.google.com/file/d/1sv4sSb9BSNVZhLzxXJ0jBv9DqD-4jnAz/view)
- Body Pose Detection: [**PoseNet**](https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5)
- Age & Gender Prediction: [**SSR-Net**](https://github.com/shamangary/SSR-Net)

<hr>

## Installation

**Important**  
*The packaged (IIFE and ESM) version of `Human` includes `TensorFlow/JS (TFJS) 2.6.0` library which can be accessed via `human.tf`*  
*You should NOT manually load another instance of `tfjs`, but if you do, be aware of possible version conflicts*  

There are multiple ways to use `Human` library, pick one that suits you:

### 1. [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) script

*Simplest way for usage within Browser*

Simply download `dist/human.js`, include it in your `HTML` file & it's ready to use.

```html
  <script src="dist/human.js"><script>
``` 

IIFE script auto-registers global namespace `human` within global `Window` object  
This way you can also use `Human` library within embbedded `<script>` tag within your `html` page for all-in-one approach  

IIFE script is distributed in minified form with attached sourcemap  

### 2. [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) module

*Recommended for usage within `Browser`*  

#### 2.1 With Bundler

If you're using bundler *(such as rollup, webpack, esbuild)* to package your client application, you can import ESM version of `Human` library which supports full tree shaking  

```js
  import human from '@vladmandic/human'; // points to @vladmandic/human/dist/human.esm.js
```

Or if you prefer to package your version of `tfjs`, you can use `nobundle` version

```js
  import tf from '@tensorflow/tfjs'
  import human from '@vladmandic/human/dist/human.nobundle.js'; // same functionality as default import, but without tfjs bundled
```


#### 2.2 Using Script Module
You could use same syntax within your main `JS` file if it's imported with `<script type="module">`  

```html
  <script src="./index.js" type="module">
```
and then in your `index.js`

```js
  import human from 'dist/human.esm.js';
```

ESM script is distributed in minified form with attached sourcemap  

### 3. [NPM](https://www.npmjs.com/) module

*Recommended for `NodeJS` projects that will execute in the backend*  

Entry point is bundle in CJS format `dist/human.node.js`  
You also need to install and include `tfjs-node` or `tfjs-node-gpu` in your project so it can register an optimized backend  

Install with:
```shell
  npm install @tensorflow/tfjs-node @vladmandic/human
```
And then use with:
```js
  const tf = require('@tensorflow/tfjs-node'); 
  const human = require('@vladmandic/human'); // points to @vladmandic/human/dist/human.node.js
```

Since NodeJS projects load `weights` from local filesystem instead of using `http` calls, you must modify default configuration to include correct paths with `file://` prefix  
For example:
```js
const config = {
  body: { enabled: true, modelPath: 'file://models/posenet/model.json' },
}
```

Note that when using `Human` in NodeJS, you must load and parse the image *before* you pass it for detection  
For example:
```js
  const buffer = fs.readFileSync(input);
  const image = tf.node.decodeImage(buffer);
  const result = human.detect(image, config);
  image.dispose();
```

### Weights

Pretrained model weights are includes in `./models`  
Default configuration uses relative paths to you entry script pointing to `../models`  
If your application resides in a different folder, modify `modelPath` property in configuration of each module  

<hr>

## Demo

Demos are included in `/demo`:

Browser:
- `demo-esm`: Demo using Browser with ESM module
- `demo-iife`: Demo using Browser with IIFE module
- `demo-webworker`: Demo using Browser with ESM module and Web Workers
*All three following demos are identical, they just illustrate different ways to load and work with `Human` library:*

NodeJS:
- `demo-node`: Demo using NodeJS with CJS module  
  This is a very simple demo as althought `Human` library is compatible with NodeJS execution  
  and is able to load images and models from local filesystem,  

<hr>

## Usage

`Human` library does not require special initialization.
All configuration is done in a single JSON object and all model weights will be dynamically loaded upon their first usage(and only then, `Human` will not load weights that it doesn't need according to configuration).

There is only *ONE* method you need:

```js
  import * as tf from '@tensorflow/tfjs';
  import human from '@vladmandic/human';

  // 'image': can be of any type of an image object: HTMLImage, HTMLVideo, HTMLMedia, Canvas, Tensor4D
  // 'options': optional parameter used to override any options present in default configuration
  const result = await human.detect(image, options?)
```

or if you want to use promises

```js
  human.detect(image, options?).then((result) => {
    // your code
  })
```

Additionally, `Human` library exposes several classes:

```js
  human.defaults // default configuration object
  human.models   // dynamically maintained object of any loaded models
  human.tf       // instance of tfjs used by human
```

<hr>

## Configuration 

Below is output of `human.defaults` object  
Any property can be overriden by passing user object during `human.detect()`  
Note that user object and default configuration are merged using deep-merge, so you do not need to redefine entire configuration  

```js
human.defaults = {
  face: {
    enabled: true,
    detector: {
      modelPath: '../models/blazeface/model.json',
      maxFaces: 10,
      skipFrames: 5,
      minConfidence: 0.8,
      iouThreshold: 0.3,
      scoreThreshold: 0.75,
    },
    mesh: {
      enabled: true,
      modelPath: '../models/facemesh/model.json',
    },
    iris: {
      enabled: true,
      modelPath: '../models/iris/model.json',
    },
    age: {
      enabled: true,
      modelPath: '../models/ssrnet-imdb-age/model.json',
      skipFrames: 5,
    },
    gender: {
      enabled: true,
      modelPath: '../models/ssrnet-imdb-gender/model.json',
    },
  },
  body: {
    enabled: true,
    modelPath: '../models/posenet/model.json',
    maxDetections: 5,
    scoreThreshold: 0.75,
    nmsRadius: 20,
  },
  hand: {
    enabled: true,
    skipFrames: 5,
    minConfidence: 0.8,
    iouThreshold: 0.3,
    scoreThreshold: 0.75,
    detector: {
      anchors: '../models/handdetect/anchors.json',
      modelPath: '../models/handdetect/model.json',
    },
    skeleton: {
      modelPath: '../models/handskeleton/model.json',
    },
  },
};
```

Where:
- `enabled`: controls if specified modul is enabled (note: module is not loaded until it is required)
- `modelPath`: path to specific pre-trained model weights
- `maxFaces`, `maxDetections`: how many faces or people are we trying to analyze. limiting number in busy scenes will result in higher performance
- `skipFrames`: how many frames to skip before re-running bounding box detection (e.g., face position does not move fast within a video, so it's ok to use previously detected face position and just run face geometry analysis)
- `minConfidence`: threshold for discarding a prediction
- `iouThreshold`: threshold for deciding whether boxes overlap too much in non-maximum suppression
- `scoreThreshold`: threshold for deciding when to remove boxes based on score in non-maximum suppression
- `nmsRadius`: radius for deciding points are too close in non-maximum suppression

<hr>

## Outputs

Result of `humand.detect()` is a single object that includes data for all enabled modules and all detected objects:

```js
result = {
  face:            // <array of detected objects>
  [
    {
      confidence,  // <number>
      box,         // <array [x, y, width, height]>
      mesh,        // <array of 3D points [x, y, z]> (468 base points & 10 iris points)
      annotations, // <list of object { landmark: array of points }> (32 base annotated landmarks & 2 iris annotations)
      iris,        // <number> (relative distance of iris to camera, multiple by focal lenght to get actual distance)
      age,         // <number> (estimated age)
      gender,      // <string> (male or female)
    }
  ],
  body:            // <array of detected objects>
  [
    {
      score,       // <number>,
      keypoints,   // <array of 2D landmarks [ score, landmark, position [x, y] ]> (17 annotated landmarks)
    }
  ],
  hand:            // <array of detected objects>
  [
    {
      confidence,  // <number>,
      box,         // <array [x, y, width, height]>,
      landmarks,   // <array of 3D points [x, y,z]> (21 points)
      annotations, // <array of 3D landmarks [ landmark: <array of points> ]> (5 annotated landmakrs)
    }
  ],
}
```

Additionally, `result` object includes internal performance data - total time spend and time per module (measured in ms):

```js
  result.performance = {
    body,
    hand,
    face,
    agegender,
    total,
  }
```

<hr>

## Build

If you want to modify the library and perform a full rebuild:  

*clone repository, install dependencies, check for errors and run full rebuild from which creates bundles from `/src` into `/dist`:*

```shell
git clone https://github.com/vladmandic/human
cd human
npm install # installs all project dependencies
npm run lint
npm run build
```

Project is written in pure `JavaScript` [ECMAScript version 2020](https://www.ecma-international.org/ecma-262/11.0/index.html)  

Only project depdendency is [@tensorflow/tfjs](https://github.com/tensorflow/tfjs)
Development dependencies are [eslint](https://github.com/eslint) used for code linting and [esbuild](https://github.com/evanw/esbuild) used for IIFE and ESM script bundling  

<hr>

## Performance

Performance will vary depending on your hardware, but also on number of resolution of input video/image, enabled modules as well as their parameters  

For example, on a desktop with a low-end nVidia GTX1050 it can perform multiple face detections at 60+ FPS, but drops to 10 FPS on a medium complex images if all modules are enabled  

Performance per module:

- Enabled all: 10 FPS
- Face Detect: 80 FPS
- Face Geometry: 30 FPS (includes face detect)
- Face Iris: 25 FPS (includes face detect and face geometry)
- Age: 60 FPS (includes face detect)
- Gender: 60 FPS (includes face detect)
- Hand: 40 FPS
- Body: 50 FPS

Library can also be used on mobile devices  

<hr>

## Todo

- Tweak default parameters
- Verify age/gender models
