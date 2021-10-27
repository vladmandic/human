/*
  Human
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
*/

// demo/typescript/index.ts
import Human from "../../dist/human.custom.esm.js";
var config = {
  modelBasePath: "../../models",
  backend: "humangl"
};
var human = new Human(config);
var result;
var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var fps = { detect: 0, draw: 0, element: document.getElementById("status") };
var log = (...msg) => console.log(...msg);
var status = (msg) => {
  if (fps.element)
    fps.element.innerText = msg;
};
async function webCam() {
  status("starting webcam...");
  const options = { audio: false, video: { facingMode: "user", resizeMode: "none", width: { ideal: document.body.clientWidth } } };
  const stream = await navigator.mediaDevices.getUserMedia(options);
  const ready = new Promise((resolve) => {
    video.onloadeddata = () => resolve(true);
  });
  video.srcObject = stream;
  video.play();
  await ready;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  const settings = track.getSettings();
  const constraints = track.getConstraints();
  log("video:", video.videoWidth, video.videoHeight, { stream, track, settings, constraints, capabilities });
  canvas.onclick = () => {
    if (video.paused)
      video.play();
    else
      video.pause();
  };
}
async function detectionLoop() {
  const t0 = human.now();
  if (!video.paused)
    result = await human.detect(video);
  const t1 = human.now();
  fps.detect = 1e3 / (t1 - t0);
  requestAnimationFrame(detectionLoop);
}
async function drawLoop() {
  const t0 = human.now();
  if (!video.paused) {
    const interpolated = await human.next(result);
    await human.draw.canvas(video, canvas);
    await human.draw.all(canvas, interpolated);
  }
  const t1 = human.now();
  fps.draw = 1e3 / (t1 - t0);
  status(video.paused ? "paused" : `fps: ${fps.detect.toFixed(1).padStart(5, " ")} detect / ${fps.draw.toFixed(1).padStart(5, " ")} draw`);
  requestAnimationFrame(drawLoop);
}
async function main() {
  status("loading...");
  await human.load();
  status("initializing...");
  await human.warmup();
  await webCam();
  await detectionLoop();
  await drawLoop();
}
window.onload = main;
//# sourceMappingURL=index.js.map
