/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */

import * as H from '../../dist/human.esm.js'; // equivalent of @vladmandic/Human

const humanConfig = { // user configuration for human, used to fine-tune behavior
  modelBasePath: 'https://vladmandic.github.io/human-models/models/',
  filter: { enabled: true, equalization: false, flip: false },
  face: { enabled: false },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },
  segmentation: {
    enabled: true,
    modelPath: 'rvm.json', // can use rvm, selfie or meet
    ratio: 0.5,
    mode: 'default',
  },
};

const backgroundImage = '../../samples/in/background.jpg';

const human = new H.Human(humanConfig); // create instance of human with overrides from user configuration

const log = (...msg) => console.log(...msg); // eslint-disable-line no-console

async function main() {
  // gather dom elements
  const dom = {
    background: document.getElementById('background'),
    webcam: document.getElementById('webcam'),
    output: document.getElementById('output'),
    merge: document.getElementById('merge'),
    mode: document.getElementById('mode'),
    composite: document.getElementById('composite'),
    ratio: document.getElementById('ratio'),
    fps: document.getElementById('fps'),
  };
  // set defaults
  dom.fps.innerText = 'initializing';
  dom.ratio.valueAsNumber = human.config.segmentation.ratio;
  dom.background.src = backgroundImage;
  dom.composite.innerHTML = ['source-atop', 'color', 'color-burn', 'color-dodge', 'copy', 'darken', 'destination-atop', 'destination-in', 'destination-out', 'destination-over', 'difference', 'exclusion', 'hard-light', 'hue', 'lighten', 'lighter', 'luminosity', 'multiply', 'overlay', 'saturation', 'screen', 'soft-light', 'source-in', 'source-out', 'source-over', 'xor'].map((gco) => `<option value="${gco}">${gco}</option>`).join(''); // eslint-disable-line max-len
  const ctxMerge = dom.merge.getContext('2d');

  log('human version:', human.version, '| tfjs version:', human.tf.version['tfjs-core']);
  log('platform:', human.env.platform, '| agent:', human.env.agent);
  await human.load(); // preload all models
  log('backend:', human.tf.getBackend(), '| available:', human.env.backends);
  log('models stats:', human.models.stats());
  log('models loaded:', human.models.loaded());
  await human.warmup(); // warmup function to initialize backend for future faster detection
  const numTensors = human.tf.engine().state.numTensors;

  // initialize webcam
  dom.webcam.onplay = () => { // start processing on video play
    log('start processing');
    dom.output.width = human.webcam.width;
    dom.output.height = human.webcam.height;
    dom.merge.width = human.webcam.width;
    dom.merge.height = human.webcam.height;
    loop(); // eslint-disable-line no-use-before-define
  };

  await human.webcam.start({ element: dom.webcam, crop: true, width: window.innerWidth / 2, height: window.innerHeight / 2 }); // use human webcam helper methods and associate webcam stream with a dom element
  if (!human.webcam.track) dom.fps.innerText = 'webcam error';

  // processing loop
  async function loop() {
    if (!human.webcam.element || human.webcam.paused) return; // check if webcam is valid and playing
    human.config.segmentation.mode = dom.mode.value; // get segmentation mode from ui
    human.config.segmentation.ratio = dom.ratio.valueAsNumber; // get segmentation downsample ratio from ui
    const t0 = Date.now();
    const rgba = await human.segmentation(human.webcam.element, human.config); // run model and process results
    const t1 = Date.now();
    if (!rgba) {
      dom.fps.innerText = 'error';
      return;
    }
    dom.fps.innerText = `fps: ${Math.round(10000 / (t1 - t0)) / 10}`; // mark performance
    human.draw.tensor(rgba, dom.output); // draw raw output
    human.tf.dispose(rgba); // dispose tensors
    ctxMerge.globalCompositeOperation = 'source-over';
    ctxMerge.drawImage(dom.background, 0, 0); // draw original video to first stacked canvas
    ctxMerge.globalCompositeOperation = dom.composite.value;
    ctxMerge.drawImage(dom.output, 0, 0); // draw processed output to second stacked canvas
    if (numTensors !== human.tf.engine().state.numTensors) log({ leak: human.tf.engine().state.numTensors - numTensors }); // check for memory leaks
    requestAnimationFrame(loop);
  }
}

window.onload = main;
