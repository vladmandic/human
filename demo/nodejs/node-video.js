/**
 * Human demo for NodeJS
 * Unsupported sample of using external utility ffmpeg to capture to decode video input and process it using Human
 *
 * Uses ffmpeg to process video input and output stream of motion jpeg images which are then parsed for frame start/end markers by pipe2jpeg
 * Each frame triggers an event with jpeg buffer that then can be decoded and passed to human for processing
 * If you want process at specific intervals, set output fps to some value
 * If you want to process an input stream, set real-time flag and set input as required
 *
 * Note that [pipe2jpeg](https://www.npmjs.com/package/pipe2jpeg) is not part of Human dependencies and should be installed manually
 * Working version of `ffmpeg` must be present on the system
*/

const process = require('process');
const spawn = require('child_process').spawn;
const log = require('@vladmandic/pilogger'); // eslint-disable-line node/no-unpublished-require
// in nodejs environments tfjs-node is required to be loaded before human
// const tf = require('@tensorflow/tfjs-node'); // eslint-disable-line node/no-unpublished-require
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Pipe2Jpeg = require('pipe2jpeg'); // eslint-disable-line node/no-missing-require, import/no-unresolved
// const human = require('@vladmandic/human'); // use this when human is installed as module (majority of use cases)
const Human = require('../../dist/human.node.js'); // use this when using human in dev mode

let count = 0; // counter
let busy = false; // busy flag
let inputFile = './test.mp4';
if (process.argv.length === 3) inputFile = process.argv[2];

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

async function detect(jpegBuffer) {
  if (busy) return; // skip processing if busy
  busy = true;
  const tensor = human.tf.node.decodeJpeg(jpegBuffer, 3); // decode jpeg buffer to raw tensor
  const res = await human.detect(tensor);
  human.tf.dispose(tensor); // must dispose tensor
  // start custom processing here
  log.data('frame', { frame: ++count, size: jpegBuffer.length, shape: tensor.shape, face: res?.face?.length, body: res?.body?.length, hand: res?.hand?.length, gesture: res?.gesture?.length });
  if (res?.face?.[0]) log.data('person', { score: [res.face[0].boxScore, res.face[0].faceScore], age: res.face[0].age || 0, gender: [res.face[0].genderScore || 0, res.face[0].gender], emotion: res.face[0].emotion?.[0] });
  // at the of processing mark loop as not busy so it can process next frame
  busy = false;
}

async function main() {
  log.header();
  await human.tf.ready();
  // pre-load models
  log.info({ human: human.version, tf: human.tf.version_core });
  log.info({ input: inputFile });
  pipe2jpeg.on('data', (jpegBuffer) => detect(jpegBuffer));

  const ffmpeg = spawn('ffmpeg', ffmpegParams, { stdio: ['ignore', 'pipe', 'ignore'] });
  ffmpeg.on('error', (error) => log.error('ffmpeg error:', error));
  ffmpeg.on('exit', (code, signal) => log.info('ffmpeg exit', code, signal));
  ffmpeg.stdout.pipe(pipe2jpeg);
}

main();
