/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */

import { Human, Config } from '../../dist/human.esm.js'; // equivalent of @vladmandic/Human

const humanConfig: Partial<Config> = { // user configuration for human, used to fine-tune behavior
  // backend: 'wasm' as const,
  // wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.18.0/dist/',
  // cacheSensitivity: 0,
  async: true,
  modelBasePath: '../../models',
  filter: { enabled: true, equalization: false, flip: false },
  face: { enabled: true, detector: { rotation: false }, mesh: { enabled: true }, attention: { enabled: false }, iris: { enabled: true }, description: { enabled: true }, emotion: { enabled: true } },
  body: { enabled: true },
  hand: { enabled: true },
  object: { enabled: false },
  gesture: { enabled: true },
};

const human = new Human(humanConfig); // create instance of human with overrides from user configuration

human.env['perfadd'] = false; // is performance data showing instant or total values
human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
human.draw.options.lineHeight = 20;

const dom = { // grab instances of dom objects so we dont have to look them up later
  video: document.getElementById('video') as HTMLVideoElement,
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  log: document.getElementById('log') as HTMLPreElement,
  fps: document.getElementById('status') as HTMLPreElement,
  perf: document.getElementById('performance') as HTMLDivElement,
};
const timestamp = { detect: 0, draw: 0, tensors: 0 }; // holds information used to calculate performance and possible memory leaks
const fps = { detect: 0, draw: 0 }; // holds calculated fps information for both detect and screen refresh

const log = (...msg) => { // helper method to output messages
  dom.log.innerText += msg.join(' ') + '\n';
  // eslint-disable-next-line no-console
  console.log(...msg);
};
const status = (msg) => dom.fps.innerText = msg; // print status element
const perf = (msg) => dom.perf.innerText = 'tensors:' + human.tf.memory().numTensors + ' | performance: ' + JSON.stringify(msg).replace(/"|{|}/g, '').replace(/,/g, ' | '); // print performance element

async function webCam() { // initialize webcam
  status('starting webcam...');
  // @ts-ignore resizeMode is not yet defined in tslib
  const options: MediaStreamConstraints = { audio: false, video: { facingMode: 'user', resizeMode: 'none', width: { ideal: document.body.clientWidth }, height: { ideal: document.body.clientHeight } } };
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(options);
  const ready = new Promise((resolve) => { dom.video.onloadeddata = () => resolve(true); });
  dom.video.srcObject = stream;
  dom.video.play();
  await ready;
  dom.canvas.width = dom.video.videoWidth;
  dom.canvas.height = dom.video.videoHeight;
  const track: MediaStreamTrack = stream.getVideoTracks()[0];
  const capabilities: MediaTrackCapabilities | string = track.getCapabilities ? track.getCapabilities() : '';
  const settings: MediaTrackSettings | string = track.getSettings ? track.getSettings() : '';
  const constraints: MediaTrackConstraints | string = track.getConstraints ? track.getConstraints() : '';
  log('video:', dom.video.videoWidth, dom.video.videoHeight, track.label, { stream, track, settings, constraints, capabilities });
  dom.canvas.onclick = () => { // pause when clicked on screen and resume on next click
    if (dom.video.paused) dom.video.play();
    else dom.video.pause();
  };
}

async function detectionLoop() { // main detection loop
  if (!dom.video.paused) {
    // console.log('profiling data:', await human.profile(dom.video));
    await human.detect(dom.video); // actual detection; were not capturing output in a local variable as it can also be reached via human.result
    const tensors = human.tf.memory().numTensors; // check current tensor usage for memory leaks
    if (tensors - timestamp.tensors !== 0) log('allocated tensors:', tensors - timestamp.tensors); // printed on start and each time there is a tensor leak
    timestamp.tensors = tensors;
  }
  const now = human.now();
  fps.detect = 1000 / (now - timestamp.detect);
  timestamp.detect = now;
  requestAnimationFrame(detectionLoop); // start new frame immediately
}

async function drawLoop() { // main screen refresh loop
  if (!dom.video.paused) {
    const interpolated = await human.next(human.result); // smoothen result using last-known results
    if (human.config.filter.flip) await human.draw.canvas(interpolated.canvas as HTMLCanvasElement, dom.canvas); // draw processed image to screen canvas
    else await human.draw.canvas(dom.video, dom.canvas); // draw original video to screen canvas // better than using procesed image as this loop happens faster than processing loop
    await human.draw.all(dom.canvas, interpolated); // draw labels, boxes, lines, etc.
    perf(interpolated.performance); // write performance data
  }
  const now = human.now();
  fps.draw = 1000 / (now - timestamp.draw);
  timestamp.draw = now;
  status(dom.video.paused ? 'paused' : `fps: ${fps.detect.toFixed(1).padStart(5, ' ')} detect | ${fps.draw.toFixed(1).padStart(5, ' ')} draw`); // write status
  // requestAnimationFrame(drawLoop); // refresh at screen refresh rate
  setTimeout(drawLoop, 30); // use to slow down refresh from max refresh rate to target of 30 fps
}

async function main() { // main entry point
  log('human version:', human.version, '| tfjs version:', human.tf.version['tfjs-core']);
  log('platform:', human.env.platform, '| agent:', human.env.agent);
  status('loading...');
  await human.load(); // preload all models
  log('backend:', human.tf.getBackend(), '| available:', human.env.backends);
  log('models stats:', human.getModelStats());
  log('models loaded:', Object.values(human.models).filter((model) => model !== null).length);
  status('initializing...');
  await human.warmup(); // warmup function to initialize backend for future faster detection
  await webCam(); // start webcam
  await detectionLoop(); // start detection loop
  await drawLoop(); // start draw loop
}

window.onload = main;
