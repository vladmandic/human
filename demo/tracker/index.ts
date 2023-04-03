/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */

import * as H from '../../dist/human.esm.js'; // equivalent of @vladmandic/Human
import tracker from './tracker.js';

const humanConfig: Partial<H.Config> = { // user configuration for human, used to fine-tune behavior
  debug: true,
  backend: 'webgl',
  // cacheSensitivity: 0,
  // cacheModels: false,
  // warmup: 'none',
  modelBasePath: 'https://vladmandic.github.io/human-models/models',
  filter: { enabled: true, equalization: false, flip: false },
  face: {
    enabled: true,
    detector: { rotation: false, maxDetected: 10, minConfidence: 0.3 },
    mesh: { enabled: true },
    attention: { enabled: false },
    iris: { enabled: false },
    description: { enabled: false },
    emotion: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
  },
  body: { enabled: false, maxDetected: 6, modelPath: 'movenet-multipose.json' },
  hand: { enabled: false },
  object: { enabled: false, maxDetected: 10 },
  segmentation: { enabled: false },
  gesture: { enabled: false },
};

interface TrackerConfig {
  unMatchedFramesTolerance: number, // number of frame when an object is not matched before considering it gone; ignored if fastDelete is set
  iouLimit: number, // exclude things from beeing matched if their IOU less than; 1 means total overlap; 0 means no overlap
  fastDelete: boolean, // remove new objects immediately if they could not be matched in the next frames; if set, ignores unMatchedFramesTolerance
  distanceLimit: number, // distance limit for matching; if values need to be excluded from matching set their distance to something greater than the distance limit
  matchingAlgorithm: 'kdTree' | 'munkres', // algorithm used to match tracks with new detections
}

interface TrackerResult {
  id: number,
  confidence: number,
  bearing: number,
  isZombie: boolean,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
}

const trackerConfig: TrackerConfig = {
  unMatchedFramesTolerance: 100,
  iouLimit: 0.05,
  fastDelete: false,
  distanceLimit: 1e4,
  matchingAlgorithm: 'kdTree',
};

const human = new H.Human(humanConfig); // create instance of human with overrides from user configuration

const dom = { // grab instances of dom objects so we dont have to look them up later
  video: document.getElementById('video') as HTMLVideoElement,
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  log: document.getElementById('log') as HTMLPreElement,
  fps: document.getElementById('status') as HTMLPreElement,
  tracker: document.getElementById('tracker') as HTMLInputElement,
  interpolation: document.getElementById('interpolation') as HTMLInputElement,
  config: document.getElementById('config') as HTMLFormElement,
  ctx: (document.getElementById('canvas') as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D,
};
const timestamp = { detect: 0, draw: 0, tensors: 0, start: 0 }; // holds information used to calculate performance and possible memory leaks
const fps = { detectFPS: 0, drawFPS: 0, frames: 0, averageMs: 0 }; // holds calculated fps information for both detect and screen refresh

const log = (...msg) => { // helper method to output messages
  dom.log.innerText += msg.join(' ') + '\n';
  console.log(...msg); // eslint-disable-line no-console
};
const status = (msg) => dom.fps.innerText = msg; // print status element

async function detectionLoop() { // main detection loop
  if (!dom.video.paused && dom.video.readyState >= 2) {
    if (timestamp.start === 0) timestamp.start = human.now();
    // log('profiling data:', await human.profile(dom.video));
    await human.detect(dom.video, humanConfig); // actual detection; were not capturing output in a local variable as it can also be reached via human.result
    const tensors = human.tf.memory().numTensors; // check current tensor usage for memory leaks
    if (tensors - timestamp.tensors !== 0) log('allocated tensors:', tensors - timestamp.tensors); // printed on start and each time there is a tensor leak
    timestamp.tensors = tensors;
    fps.detectFPS = Math.round(1000 * 1000 / (human.now() - timestamp.detect)) / 1000;
    fps.frames++;
    fps.averageMs = Math.round(1000 * (human.now() - timestamp.start) / fps.frames) / 1000;
  }
  timestamp.detect = human.now();
  requestAnimationFrame(detectionLoop); // start new frame immediately
}

function drawLoop() { // main screen refresh loop
  if (!dom.video.paused && dom.video.readyState >= 2) {
    const res: H.Result = dom.interpolation.checked ? human.next(human.result) : human.result; // interpolate results if enabled
    let tracking: H.FaceResult[] | H.BodyResult[] | H.ObjectResult[] = [];
    if (human.config.face.enabled) tracking = res.face;
    else if (human.config.body.enabled) tracking = res.body;
    else if (human.config.object.enabled) tracking = res.object;
    else log('unknown object type');
    let data: TrackerResult[] = [];
    if (dom.tracker.checked) {
      const items = tracking.map((obj) => ({
        x: obj.box[0] + obj.box[2] / 2,
        y: obj.box[1] + obj.box[3] / 2,
        w: obj.box[2],
        h: obj.box[3],
        name: obj.label || (human.config.face.enabled ? 'face' : 'body'),
        confidence: obj.score,
      }));
      tracker.updateTrackedItemsWithNewFrame(items, fps.frames);
      data = tracker.getJSONOfTrackedItems(true) as TrackerResult[];
    }
    human.draw.canvas(dom.video, dom.canvas); // copy input video frame to output canvas
    for (let i = 0; i < tracking.length; i++) {
      // @ts-ignore
      const name = tracking[i].label || (human.config.face.enabled ? 'face' : 'body');
      dom.ctx.strokeRect(tracking[i].box[0], tracking[i].box[1], tracking[i].box[1], tracking[i].box[2]);
      dom.ctx.fillText(`id: ${tracking[i].id} ${Math.round(100 * tracking[i].score)}% ${name}`, tracking[i].box[0] + 4, tracking[i].box[1] + 16);
      if (data[i]) {
        dom.ctx.fillText(`t: ${data[i].id} ${Math.round(100 * data[i].confidence)}% ${data[i].name} ${data[i].isZombie ? 'zombie' : ''}`, tracking[i].box[0] + 4, tracking[i].box[1] + 34);
      }
    }
  }
  const now = human.now();
  fps.drawFPS = Math.round(1000 * 1000 / (now - timestamp.draw)) / 1000;
  timestamp.draw = now;
  status(dom.video.paused ? 'paused' : `fps: ${fps.detectFPS.toFixed(1).padStart(5, ' ')} detect | ${fps.drawFPS.toFixed(1).padStart(5, ' ')} draw`); // write status
  setTimeout(drawLoop, 30); // use to slow down refresh from max refresh rate to target of 30 fps
}

async function handleVideo(file: File) {
  const url = URL.createObjectURL(file);
  dom.video.src = url;
  await dom.video.play();
  log('loaded video:', file.name, 'resolution:', [dom.video.videoWidth, dom.video.videoHeight], 'duration:', dom.video.duration);
  dom.canvas.width = dom.video.videoWidth;
  dom.canvas.height = dom.video.videoHeight;
  dom.ctx.strokeStyle = 'white';
  dom.ctx.fillStyle = 'white';
  dom.ctx.font = '16px Segoe UI';
  dom.video.playbackRate = 0.25;
}

function initInput() {
  document.body.addEventListener('dragenter', (evt) => evt.preventDefault());
  document.body.addEventListener('dragleave', (evt) => evt.preventDefault());
  document.body.addEventListener('dragover', (evt) => evt.preventDefault());
  document.body.addEventListener('drop', async (evt) => {
    evt.preventDefault();
    if (evt.dataTransfer) evt.dataTransfer.dropEffect = 'copy';
    const file = evt.dataTransfer?.files?.[0];
    if (file) await handleVideo(file);
    log(dom.video.readyState);
  });
  (document.getElementById('inputvideo') as HTMLInputElement).onchange = async (evt) => {
    evt.preventDefault();
    const file = evt.target?.['files']?.[0];
    if (file) await handleVideo(file);
  };
  dom.config.onchange = () => {
    trackerConfig.distanceLimit = (document.getElementById('distanceLimit') as HTMLInputElement).valueAsNumber;
    trackerConfig.iouLimit = (document.getElementById('iouLimit') as HTMLInputElement).valueAsNumber;
    trackerConfig.unMatchedFramesTolerance = (document.getElementById('unMatchedFramesTolerance') as HTMLInputElement).valueAsNumber;
    trackerConfig.unMatchedFramesTolerance = (document.getElementById('unMatchedFramesTolerance') as HTMLInputElement).valueAsNumber;
    trackerConfig.matchingAlgorithm = (document.getElementById('matchingAlgorithm-kdTree') as HTMLInputElement).checked ? 'kdTree' : 'munkres';
    tracker.setParams(trackerConfig);
    if ((document.getElementById('keepInMemory') as HTMLInputElement).checked) tracker.enableKeepInMemory();
    else tracker.disableKeepInMemory();
    tracker.reset();
    log('tracker config change', JSON.stringify(trackerConfig));
    humanConfig.face!.enabled = (document.getElementById('box-face') as HTMLInputElement).checked; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    humanConfig.body!.enabled = (document.getElementById('box-body') as HTMLInputElement).checked; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    humanConfig.object!.enabled = (document.getElementById('box-object') as HTMLInputElement).checked; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  };
  dom.tracker.onchange = (evt) => {
    log('tracker', (evt.target as HTMLInputElement).checked ? 'enabled' : 'disabled');
    tracker.setParams(trackerConfig);
    tracker.reset();
  };
}

async function main() { // main entry point
  log('human version:', human.version, '| tfjs version:', human.tf.version['tfjs-core']);
  log('platform:', human.env.platform, '| agent:', human.env.agent);
  status('loading...');
  await human.load(); // preload all models
  log('backend:', human.tf.getBackend(), '| available:', human.env.backends);
  log('models loaded:', human.models.loaded());
  status('initializing...');
  await human.warmup(); // warmup function to initialize backend for future faster detection
  initInput(); // initialize input
  await detectionLoop(); // start detection loop
  drawLoop(); // start draw loop
}

window.onload = main;
