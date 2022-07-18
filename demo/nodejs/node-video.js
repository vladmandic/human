/**
 * Human demo for NodeJS
 * Unsupported sample of using external utility ffmpeg to capture to decode video input and process it using Human
 *
 * Uses ffmpeg to process video input and output stream of motion jpeg images which are then parsed for frame start/end markers by pipe2jpeg
 * Each frame triggers an event with jpeg buffer that then can be decoded and passed to human for processing
 * If you want process at specific intervals, set output fps to some value
 * If you want to process an input stream, set real-time flag and set input as required
 *
 * Note that pipe2jpeg is not part of Human dependencies and should be installed manually
 * Working version of ffmpeg must be present on the system
*/

const spawn = require('child_process').spawn;
const log = require('@vladmandic/pilogger');
// @ts-ignore pipe2jpeg is not installed by default
// eslint-disable-next-line node/no-missing-require
const Pipe2Jpeg = require('pipe2jpeg');

// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars, @typescript-eslint/no-unused-vars
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before human
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

let count = 0; // counter
let busy = false; // busy flag
const inputFile = './test.mp4';

const humanConfig = {
  modelBasePath: 'file://models/',
  debug: false,
  async: true,
  filter: { enabled: false },
  face: {
    enabled: true,
    detector: { enabled: true, rotation: false },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: true },
  },
  hand: { enabled: false },
  body: { enabled: false },
  object: { enabled: false },
};

const human = new Human.Human(humanConfig);
const pipe2jpeg = new Pipe2Jpeg();

const ffmpegParams = [
  '-loglevel', 'quiet',
  // input
  // '-re', // optional process video in real-time not as fast as possible
  '-i', `${inputFile}`, // input file
  // output
  '-an', // drop audio
  '-c:v', 'mjpeg', // use motion jpeg as output encoder
  '-pix_fmt', 'yuvj422p', // typical for mp4, may need different settings for some videos
  '-f', 'image2pipe', // pipe images as output
  // '-vf', 'fps=5,scale=800:600', // optional video filter, do anything here such as process at fixed 5fps or resize to specific resulution
  'pipe:1', // output to unix pipe that is then captured by pipe2jpeg
];

async function process(jpegBuffer) {
  if (busy) return; // skip processing if busy
  busy = true;
  const tensor = human.tf.node.decodeJpeg(jpegBuffer, 3); // decode jpeg buffer to raw tensor
  log.state('input frame:', ++count, 'size:', jpegBuffer.length, 'decoded shape:', tensor.shape);
  const res = await human.detect(tensor);
  log.data('gesture', JSON.stringify(res.gesture));
  // do processing here
  tf.dispose(tensor); // must dispose tensor
  busy = false;
}

async function main() {
  log.header();
  await human.tf.ready();
  // pre-load models
  log.info('human:', human.version);
  pipe2jpeg.on('jpeg', (jpegBuffer) => process(jpegBuffer));

  const ffmpeg = spawn('ffmpeg', ffmpegParams, { stdio: ['ignore', 'pipe', 'ignore'] });
  ffmpeg.on('error', (error) => log.error('ffmpeg error:', error));
  ffmpeg.on('exit', (code, signal) => log.info('ffmpeg exit', code, signal));
  ffmpeg.stdout.pipe(pipe2jpeg);
}

main();
