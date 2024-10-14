/*
  Human
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
*/


// demo/typescript/index.ts
import * as H from "../../dist/human.esm.js";
var width = 1920;
var humanConfig = {
  // user configuration for human, used to fine-tune behavior
  debug: true,
  backend: "webgl",
  // cacheSensitivity: 0,
  // cacheModels: false,
  // warmup: 'none',
  // modelBasePath: '../../models',
  modelBasePath: "https://vladmandic.github.io/human-models/models/",
  filter: { enabled: true, equalization: false, flip: false },
  face: { enabled: true, detector: { rotation: false }, mesh: { enabled: true }, attention: { enabled: false }, iris: { enabled: true }, description: { enabled: true }, emotion: { enabled: true }, antispoof: { enabled: true }, liveness: { enabled: true } },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  segmentation: { enabled: false },
  gesture: { enabled: true }
};
var human = new H.Human(humanConfig);
human.env.perfadd = false;
human.draw.options.font = 'small-caps 18px "Lato"';
human.draw.options.lineHeight = 20;
human.draw.options.drawPoints = true;
var dom = {
  // grab instances of dom objects so we dont have to look them up later
  video: document.getElementById("video"),
  canvas: document.getElementById("canvas"),
  log: document.getElementById("log"),
  fps: document.getElementById("status"),
  perf: document.getElementById("performance")
};
var timestamp = { detect: 0, draw: 0, tensors: 0, start: 0 };
var fps = { detectFPS: 0, drawFPS: 0, frames: 0, averageMs: 0 };
var log = (...msg) => {
  dom.log.innerText += msg.join(" ") + "\n";
  console.log(...msg);
};
var status = (msg) => dom.fps.innerText = msg;
var perf = (msg) => dom.perf.innerText = "tensors:" + human.tf.memory().numTensors.toString() + " | performance: " + JSON.stringify(msg).replace(/"|{|}/g, "").replace(/,/g, " | ");
async function detectionLoop() {
  if (!dom.video.paused) {
    if (timestamp.start === 0) timestamp.start = human.now();
    await human.detect(dom.video);
    const tensors = human.tf.memory().numTensors;
    if (tensors - timestamp.tensors !== 0) log("allocated tensors:", tensors - timestamp.tensors);
    timestamp.tensors = tensors;
    fps.detectFPS = Math.round(1e3 * 1e3 / (human.now() - timestamp.detect)) / 1e3;
    fps.frames++;
    fps.averageMs = Math.round(1e3 * (human.now() - timestamp.start) / fps.frames) / 1e3;
    if (fps.frames % 100 === 0 && !dom.video.paused) log("performance", { ...fps, tensors: timestamp.tensors });
  }
  timestamp.detect = human.now();
  requestAnimationFrame(detectionLoop);
}
async function drawLoop() {
  var _a, _b, _c;
  if (!dom.video.paused) {
    const interpolated = human.next(human.result);
    const processed = await human.image(dom.video);
    human.draw.canvas(processed.canvas, dom.canvas);
    const opt = { bodyLabels: `person confidence [score] and ${(_c = (_b = (_a = human.result) == null ? void 0 : _a.body) == null ? void 0 : _b[0]) == null ? void 0 : _c.keypoints.length} keypoints` };
    await human.draw.all(dom.canvas, interpolated, opt);
    perf(interpolated.performance);
  }
  const now = human.now();
  fps.drawFPS = Math.round(1e3 * 1e3 / (now - timestamp.draw)) / 1e3;
  timestamp.draw = now;
  status(dom.video.paused ? "paused" : `fps: ${fps.detectFPS.toFixed(1).padStart(5, " ")} detect | ${fps.drawFPS.toFixed(1).padStart(5, " ")} draw`);
  setTimeout(drawLoop, 30);
}
async function webCam() {
  const devices = await human.webcam.enumerate();
  const id = devices[0].deviceId;
  const webcamStatus = await human.webcam.start({ element: dom.video, crop: false, width, id });
  log(webcamStatus);
  dom.canvas.width = human.webcam.width;
  dom.canvas.height = human.webcam.height;
  dom.canvas.onclick = async () => {
    if (human.webcam.paused) await human.webcam.play();
    else human.webcam.pause();
  };
}
async function main() {
  log("human version:", human.version, "| tfjs version:", human.tf.version["tfjs-core"]);
  log("platform:", human.env.platform, "| agent:", human.env.agent);
  status("loading...");
  await human.load();
  log("backend:", human.tf.getBackend(), "| available:", human.env.backends);
  log("models stats:", human.models.stats());
  log("models loaded:", human.models.loaded());
  log("environment", human.env);
  status("initializing...");
  await human.warmup();
  await webCam();
  await detectionLoop();
  await drawLoop();
}
window.onload = main;
//# sourceMappingURL=index.js.map
