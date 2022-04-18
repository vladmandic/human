/*
  Human
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
*/

// demo/faceid/index.ts
import { Human } from "../../dist/human.esm.js";

// demo/faceid/indexdb.ts
var db;
var database = "human";
var table = "person";
var log = (...msg) => console.log("indexdb", ...msg);
async function open() {
  if (db)
    return true;
  return new Promise((resolve) => {
    const request = indexedDB.open(database, 1);
    request.onerror = (evt) => log("error:", evt);
    request.onupgradeneeded = (evt) => {
      log("create:", evt.target);
      db = evt.target.result;
      db.createObjectStore(table, { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = (evt) => {
      db = evt.target.result;
      log("open:", db);
      resolve(true);
    };
  });
}
async function load() {
  const faceDB = [];
  if (!db)
    await open();
  return new Promise((resolve) => {
    const cursor = db.transaction([table], "readwrite").objectStore(table).openCursor(null, "next");
    cursor.onerror = (evt) => log("load error:", evt);
    cursor.onsuccess = (evt) => {
      if (evt.target.result) {
        faceDB.push(evt.target.result.value);
        evt.target.result.continue();
      } else {
        resolve(faceDB);
      }
    };
  });
}
async function count() {
  if (!db)
    await open();
  return new Promise((resolve) => {
    const store = db.transaction([table], "readwrite").objectStore(table).count();
    store.onerror = (evt) => log("count error:", evt);
    store.onsuccess = () => resolve(store.result);
  });
}
async function save(faceRecord) {
  if (!db)
    await open();
  const newRecord = { name: faceRecord.name, descriptor: faceRecord.descriptor, image: faceRecord.image };
  db.transaction([table], "readwrite").objectStore(table).put(newRecord);
  log("save:", newRecord);
}
async function remove(faceRecord) {
  if (!db)
    await open();
  db.transaction([table], "readwrite").objectStore(table).delete(faceRecord.id);
  log("delete:", faceRecord);
}

// demo/faceid/index.ts
var humanConfig = {
  modelBasePath: "../../models",
  filter: { equalization: true },
  face: {
    enabled: true,
    detector: { rotation: true, return: true, cropFactor: 1.6, mask: false },
    description: { enabled: true },
    mobilefacenet: { enabled: false, modelPath: "https://vladmandic.github.io/human-models/models/mobilefacenet.json" },
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
var matchOptions = { order: 2, multiplier: 25, min: 0.2, max: 0.8 };
var options = {
  minConfidence: 0.6,
  minSize: 224,
  maxTime: 1e4,
  blinkMin: 10,
  blinkMax: 800,
  threshold: 0.5,
  mask: humanConfig.face.detector.mask,
  rotation: humanConfig.face.detector.rotation,
  cropFactor: humanConfig.face.detector.cropFactor,
  ...matchOptions
};
var ok = {
  faceCount: false,
  faceConfidence: false,
  facingCenter: false,
  lookingCenter: false,
  blinkDetected: false,
  faceSize: false,
  antispoofCheck: false,
  livenessCheck: false,
  elapsedMs: 0
};
var allOk = () => ok.faceCount && ok.faceSize && ok.blinkDetected && ok.facingCenter && ok.lookingCenter && ok.faceConfidence && ok.antispoofCheck && ok.livenessCheck;
var current = { face: null, record: null };
var blink = {
  start: 0,
  end: 0,
  time: 0
};
var human = new Human(humanConfig);
human.env["perfadd"] = false;
human.draw.options.font = 'small-caps 18px "Lato"';
human.draw.options.lineHeight = 20;
var dom = {
  video: document.getElementById("video"),
  canvas: document.getElementById("canvas"),
  log: document.getElementById("log"),
  fps: document.getElementById("fps"),
  match: document.getElementById("match"),
  name: document.getElementById("name"),
  save: document.getElementById("save"),
  delete: document.getElementById("delete"),
  retry: document.getElementById("retry"),
  source: document.getElementById("source"),
  ok: document.getElementById("ok")
};
var timestamp = { detect: 0, draw: 0 };
var fps = { detect: 0, draw: 0 };
var startTime = 0;
var log2 = (...msg) => {
  dom.log.innerText += msg.join(" ") + "\n";
  console.log(...msg);
};
var printFPS = (msg) => dom.fps.innerText = msg;
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
  if (human.env.initial)
    log2("video:", dom.video.videoWidth, dom.video.videoHeight, "|", stream.getVideoTracks()[0].label);
  dom.canvas.onclick = () => {
    if (dom.video.paused)
      dom.video.play();
    else
      dom.video.pause();
  };
}
async function detectionLoop() {
  if (!dom.video.paused) {
    if (current.face && current.face.tensor)
      human.tf.dispose(current.face.tensor);
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
    ok.blinkDetected = ok.blinkDetected || Math.abs(blink.end - blink.start) > options.blinkMin && Math.abs(blink.end - blink.start) < options.blinkMax;
    if (ok.blinkDetected && blink.time === 0)
      blink.time = Math.trunc(blink.end - blink.start);
    ok.facingCenter = gestures.includes("facing center");
    ok.lookingCenter = gestures.includes("looking center");
    ok.faceConfidence = (human.result.face[0].boxScore || 0) > options.minConfidence && (human.result.face[0].faceScore || 0) > options.minConfidence && (human.result.face[0].genderScore || 0) > options.minConfidence;
    ok.antispoofCheck = (human.result.face[0].real || 0) > options.minConfidence;
    ok.livenessCheck = (human.result.face[0].live || 0) > options.minConfidence;
    ok.faceSize = human.result.face[0].box[2] >= options.minSize && human.result.face[0].box[3] >= options.minSize;
  }
  let y = 32;
  for (const [key, val] of Object.entries(ok)) {
    let el = document.getElementById(`ok-${key}`);
    if (!el) {
      el = document.createElement("div");
      el.innerText = key;
      el.className = "ok";
      el.style.top = `${y}px`;
      dom.ok.appendChild(el);
    }
    if (typeof val === "boolean")
      el.style.backgroundColor = val ? "lightgreen" : "lightcoral";
    else
      el.innerText = `${key}:${val}`;
    y += 28;
  }
  if (allOk()) {
    dom.video.pause();
    return human.result.face[0];
  }
  if (ok.elapsedMs > options.maxTime) {
    dom.video.pause();
    return human.result.face[0];
  } else {
    ok.elapsedMs = Math.trunc(human.now() - startTime);
    return new Promise((resolve) => {
      setTimeout(async () => {
        const res = await validationLoop();
        if (res)
          resolve(human.result.face[0]);
      }, 30);
    });
  }
}
async function saveRecords() {
  var _a, _b;
  if (dom.name.value.length > 0) {
    const image = (_a = dom.canvas.getContext("2d")) == null ? void 0 : _a.getImageData(0, 0, dom.canvas.width, dom.canvas.height);
    const rec = { id: 0, name: dom.name.value, descriptor: (_b = current.face) == null ? void 0 : _b.embedding, image };
    await save(rec);
    log2("saved face record:", rec.name);
  } else {
    log2("invalid name");
  }
}
async function deleteRecord() {
  if (current.record && current.record.id > 0) {
    await remove(current.record);
  }
}
async function detectFace() {
  var _a, _b;
  (_a = dom.canvas.getContext("2d")) == null ? void 0 : _a.clearRect(0, 0, options.minSize, options.minSize);
  if (!current.face || !current.face.tensor || !current.face.embedding)
    return false;
  console.log("face record:", current.face);
  human.tf.browser.toPixels(current.face.tensor, dom.canvas);
  if (await count() === 0) {
    log2("face database is empty");
    document.body.style.background = "black";
    dom.delete.style.display = "none";
    return false;
  }
  const db2 = await load();
  const descriptors = db2.map((rec) => rec.descriptor);
  const res = await human.match(current.face.embedding, descriptors, matchOptions);
  current.record = db2[res.index] || null;
  if (current.record) {
    log2(`best match: ${current.record.name} | id: ${current.record.id} | similarity: ${Math.round(1e3 * res.similarity) / 10}%`);
    dom.name.value = current.record.name;
    dom.source.style.display = "";
    (_b = dom.source.getContext("2d")) == null ? void 0 : _b.putImageData(current.record.image, 0, 0);
  }
  document.body.style.background = res.similarity > options.threshold ? "darkgreen" : "maroon";
  return res.similarity > options.threshold;
}
async function main() {
  var _a, _b, _c, _d;
  ok.faceCount = false;
  ok.faceConfidence = false;
  ok.facingCenter = false;
  ok.blinkDetected = false;
  ok.faceSize = false;
  ok.antispoofCheck = false;
  ok.livenessCheck = false;
  ok.elapsedMs = 0;
  dom.match.style.display = "none";
  dom.retry.style.display = "none";
  dom.source.style.display = "none";
  document.body.style.background = "black";
  await webCam();
  await detectionLoop();
  startTime = human.now();
  current.face = await validationLoop();
  dom.canvas.width = ((_b = (_a = current.face) == null ? void 0 : _a.tensor) == null ? void 0 : _b.shape[1]) || options.minSize;
  dom.canvas.height = ((_d = (_c = current.face) == null ? void 0 : _c.tensor) == null ? void 0 : _d.shape[0]) || options.minSize;
  dom.source.width = dom.canvas.width;
  dom.source.height = dom.canvas.height;
  dom.canvas.style.width = "";
  dom.match.style.display = "flex";
  dom.save.style.display = "flex";
  dom.delete.style.display = "flex";
  dom.retry.style.display = "block";
  if (!allOk()) {
    log2("did not find valid face");
    return false;
  } else {
    return detectFace();
  }
}
async function init() {
  log2("human version:", human.version, "| tfjs version:", human.tf.version["tfjs-core"]);
  log2("options:", JSON.stringify(options).replace(/{|}|"|\[|\]/g, "").replace(/,/g, " "));
  printFPS("loading...");
  log2("known face records:", await count());
  await webCam();
  await human.load();
  printFPS("initializing...");
  dom.retry.addEventListener("click", main);
  dom.save.addEventListener("click", saveRecords);
  dom.delete.addEventListener("click", deleteRecord);
  await human.warmup();
  await main();
}
window.onload = init;
/**
 * Human demo for browsers
 * @default Human Library
 * @summary <https://github.com/vladmandic/human>
 * @author <https://github.com/vladmandic>
 * @copyright <https://github.com/vladmandic>
 * @license MIT
 */
//# sourceMappingURL=index.js.map
