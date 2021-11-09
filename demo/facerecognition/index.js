/*
  Human
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
*/

// demo/facerecognition/index.ts
import { Human } from "../../dist/human.esm.js";
var humanConfig = {
  modelBasePath: "../../models",
  filter: { equalization: true },
  face: {
    enabled: true,
    detector: { rotation: true, return: true },
    description: { enabled: true },
    iris: { enabled: true },
    emotion: { enabled: false },
    antispoof: { enabled: true },
    liveness: { enabled: true }
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: true }
};
var options = {
  faceDB: "../facematch/faces.json",
  minConfidence: 0.6,
  minSize: 224,
  maxTime: 1e4,
  blinkMin: 10,
  blinkMax: 800
};
var ok = {
  faceCount: false,
  faceConfidence: false,
  facingCenter: false,
  blinkDetected: false,
  faceSize: false,
  antispoofCheck: false,
  livenessCheck: false,
  elapsedMs: 0
};
var allOk = () => ok.faceCount && ok.faceSize && ok.blinkDetected && ok.facingCenter && ok.faceConfidence && ok.antispoofCheck && ok.livenessCheck;
var blink = {
  start: 0,
  end: 0,
  time: 0
};
var db = [];
var human = new Human(humanConfig);
human.env["perfadd"] = false;
human.draw.options.font = 'small-caps 18px "Lato"';
human.draw.options.lineHeight = 20;
var dom = {
  video: document.getElementById("video"),
  canvas: document.getElementById("canvas"),
  log: document.getElementById("log"),
  fps: document.getElementById("fps"),
  status: document.getElementById("status")
};
var timestamp = { detect: 0, draw: 0 };
var fps = { detect: 0, draw: 0 };
var startTime = 0;
var log = (...msg) => {
  dom.log.innerText += msg.join(" ") + "\n";
  console.log(...msg);
};
var printFPS = (msg) => dom.fps.innerText = msg;
var printStatus = (msg) => dom.status.innerText = "status: " + JSON.stringify(msg).replace(/"|{|}/g, "").replace(/,/g, " | ");
async function webCam() {
  printFPS("starting webcam...");
  const cameraOptions = { audio: false, video: { facingMode: "user", resizeMode: "none", width: { ideal: document.body.clientWidth } } };
  const stream = await navigator.mediaDevices.getUserMedia(cameraOptions);
  const ready = new Promise((resolve) => {
    dom.video.onloadeddata = () => resolve(true);
  });
  dom.video.srcObject = stream;
  dom.video.play();
  await ready;
  dom.canvas.width = dom.video.videoWidth;
  dom.canvas.height = dom.video.videoHeight;
  log("video:", dom.video.videoWidth, dom.video.videoHeight, stream.getVideoTracks()[0].label);
  dom.canvas.onclick = () => {
    if (dom.video.paused)
      dom.video.play();
    else
      dom.video.pause();
  };
}
async function detectionLoop() {
  if (!dom.video.paused) {
    await human.detect(dom.video);
    const now = human.now();
    fps.detect = 1e3 / (now - timestamp.detect);
    timestamp.detect = now;
    requestAnimationFrame(detectionLoop);
  }
}
async function validationLoop() {
  const interpolated = await human.next(human.result);
  await human.draw.canvas(dom.video, dom.canvas);
  await human.draw.all(dom.canvas, interpolated);
  const now = human.now();
  fps.draw = 1e3 / (now - timestamp.draw);
  timestamp.draw = now;
  printFPS(`fps: ${fps.detect.toFixed(1).padStart(5, " ")} detect | ${fps.draw.toFixed(1).padStart(5, " ")} draw`);
  ok.faceCount = human.result.face.length === 1;
  if (ok.faceCount) {
    const gestures = Object.values(human.result.gesture).map((gesture) => gesture.gesture);
    if (gestures.includes("blink left eye") || gestures.includes("blink right eye"))
      blink.start = human.now();
    if (blink.start > 0 && !gestures.includes("blink left eye") && !gestures.includes("blink right eye"))
      blink.end = human.now();
    ok.blinkDetected = ok.blinkDetected || blink.end - blink.start > options.blinkMin && blink.end - blink.start < options.blinkMax;
    if (ok.blinkDetected && blink.time === 0)
      blink.time = Math.trunc(blink.end - blink.start);
    ok.facingCenter = gestures.includes("facing center") && gestures.includes("looking center");
    ok.faceConfidence = (human.result.face[0].boxScore || 0) > options.minConfidence && (human.result.face[0].faceScore || 0) > options.minConfidence && (human.result.face[0].genderScore || 0) > options.minConfidence;
    ok.antispoofCheck = (human.result.face[0].real || 0) > options.minConfidence;
    ok.livenessCheck = (human.result.face[0].live || 0) > options.minConfidence;
    ok.faceSize = human.result.face[0].box[2] >= options.minSize && human.result.face[0].box[3] >= options.minSize;
  }
  printStatus(ok);
  if (allOk()) {
    dom.video.pause();
    return human.result.face;
  } else {
    human.tf.dispose(human.result.face[0].tensor);
  }
  if (ok.elapsedMs > options.maxTime) {
    dom.video.pause();
    return human.result.face;
  } else {
    ok.elapsedMs = Math.trunc(human.now() - startTime);
    return new Promise((resolve) => {
      setTimeout(async () => {
        const res = await validationLoop();
        if (res)
          resolve(human.result.face);
      }, 30);
    });
  }
}
async function detectFace(face) {
  dom.canvas.width = face.tensor.shape[2];
  dom.canvas.height = face.tensor.shape[1];
  dom.canvas.style.width = "";
  human.tf.browser.toPixels(face.tensor, dom.canvas);
  human.tf.dispose(face.tensor);
  const arr = db.map((rec) => rec.embedding);
  const res = await human.match(face.embedding, arr);
  log(`found best match: ${db[res.index].name} similarity: ${Math.round(1e3 * res.similarity) / 10}% source: ${db[res.index].source}`);
}
async function loadFaceDB() {
  const res = await fetch(options.faceDB);
  db = res && res.ok ? await res.json() : [];
  log("loaded face db:", options.faceDB, "records:", db.length);
}
async function main() {
  log("human version:", human.version, "| tfjs version:", human.tf.version_core);
  printFPS("loading...");
  await loadFaceDB();
  await human.load();
  printFPS("initializing...");
  await human.warmup();
  await webCam();
  await detectionLoop();
  startTime = human.now();
  const face = await validationLoop();
  if (!allOk())
    log("did not find valid input", face);
  else {
    log("found valid face", face);
    await detectFace(face[0]);
  }
  dom.fps.style.display = "none";
}
window.onload = main;
/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */
//# sourceMappingURL=index.js.map
