/*
  Human
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
*/

// demo/typescript/index.ts
import Human from "../../dist/human.custom.esm.js";
var config = {
  modelBasePath: "../../models",
  backend: "humangl",
  async: true
};
var human = new Human(config);
var result;
var dom = {
  video: document.getElementById("video"),
  canvas: document.getElementById("canvas"),
  log: document.getElementById("log"),
  fps: document.getElementById("status"),
  perf: document.getElementById("performance")
};
var fps = { detect: 0, draw: 0 };
var log = (...msg) => {
  dom.log.innerText += msg.join(" ") + "\n";
  console.log(...msg);
};
var status = (msg) => {
  dom.fps.innerText = msg;
};
var perf = (msg) => {
  dom.perf.innerText = "performance: " + JSON.stringify(msg).replace(/"|{|}/g, "").replace(/,/g, " | ");
};
async function webCam() {
  status("starting webcam...");
  const options = { audio: false, video: { facingMode: "user", resizeMode: "none", width: { ideal: document.body.clientWidth } } };
  const stream = await navigator.mediaDevices.getUserMedia(options);
  const ready = new Promise((resolve) => {
    dom.video.onloadeddata = () => resolve(true);
  });
  dom.video.srcObject = stream;
  dom.video.play();
  await ready;
  dom.canvas.width = dom.video.videoWidth;
  dom.canvas.height = dom.video.videoHeight;
  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  const settings = track.getSettings();
  const constraints = track.getConstraints();
  log("video:", dom.video.videoWidth, dom.video.videoHeight, track.label, { stream, track, settings, constraints, capabilities });
  dom.canvas.onclick = () => {
    if (dom.video.paused)
      dom.video.play();
    else
      dom.video.pause();
  };
}
async function detectionLoop() {
  const t0 = human.now();
  if (!dom.video.paused) {
    result = await human.detect(dom.video);
  }
  const t1 = human.now();
  fps.detect = 1e3 / (t1 - t0);
  requestAnimationFrame(detectionLoop);
}
async function drawLoop() {
  const t0 = human.now();
  if (!dom.video.paused) {
    const interpolated = await human.next(result);
    await human.draw.canvas(dom.video, dom.canvas);
    await human.draw.all(dom.canvas, interpolated);
    perf(interpolated.performance);
  }
  const t1 = human.now();
  fps.draw = 1e3 / (t1 - t0);
  status(dom.video.paused ? "paused" : `fps: ${fps.detect.toFixed(1).padStart(5, " ")} detect / ${fps.draw.toFixed(1).padStart(5, " ")} draw`);
  requestAnimationFrame(drawLoop);
}
async function main() {
  log("human version:", human.version, "tfjs:", human.tf.version_core);
  log("platform:", human.env.platform, "agent:", human.env.agent);
  human.env.perfadd = true;
  status("loading...");
  await human.load();
  status("initializing...");
  log("backend:", human.tf.getBackend(), "available:", human.env.backends);
  await human.warmup();
  await webCam();
  await detectionLoop();
  await drawLoop();
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
