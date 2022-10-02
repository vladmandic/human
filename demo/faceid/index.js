/*
  Human
  homepage: <https://github.com/vladmandic/human>
  author: <https://github.com/vladmandic>'
*/


// demo/faceid/index.ts
import * as H from "../../dist/human.esm.js";

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
  cacheSensitivity: 0,
  modelBasePath: "../../models",
  filter: { equalization: true },
  face: {
    enabled: true,
    detector: { rotation: true, return: true, cropFactor: 1.6, mask: false },
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
var matchOptions = { order: 2, multiplier: 25, min: 0.2, max: 0.8 };
var options = {
  minConfidence: 0.6,
  minSize: 224,
  maxTime: 3e4,
  blinkMin: 10,
  blinkMax: 800,
  threshold: 0.5,
  mask: humanConfig.face.detector.mask,
  rotation: humanConfig.face.detector.rotation,
  cropFactor: humanConfig.face.detector.cropFactor,
  ...matchOptions
};
var ok = {
  faceCount: { status: false, val: 0 },
  faceConfidence: { status: false, val: 0 },
  facingCenter: { status: false, val: 0 },
  lookingCenter: { status: false, val: 0 },
  blinkDetected: { status: false, val: 0 },
  faceSize: { status: false, val: 0 },
  antispoofCheck: { status: false, val: 0 },
  livenessCheck: { status: false, val: 0 },
  age: { status: false, val: 0 },
  gender: { status: false, val: 0 },
  timeout: { status: true, val: 0 },
  descriptor: { status: false, val: 0 },
  elapsedMs: { status: void 0, val: 0 },
  detectFPS: { status: void 0, val: 0 },
  drawFPS: { status: void 0, val: 0 }
};
var allOk = () => ok.faceCount.status && ok.faceSize.status && ok.blinkDetected.status && ok.facingCenter.status && ok.lookingCenter.status && ok.faceConfidence.status && ok.antispoofCheck.status && ok.livenessCheck.status && ok.descriptor.status && ok.age.status && ok.gender.status;
var current = { face: null, record: null };
var blink = {
  start: 0,
  end: 0,
  time: 0
};
var human = new H.Human(humanConfig);
human.env.perfadd = false;
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
var startTime = 0;
var log2 = (...msg) => {
  dom.log.innerText += msg.join(" ") + "\n";
  console.log(...msg);
};
async function webCam() {
  const cameraOptions = { audio: false, video: { facingMode: "user", resizeMode: "none", width: { ideal: document.body.clientWidth } } };
  const stream = await navigator.mediaDevices.getUserMedia(cameraOptions);
  const ready = new Promise((resolve) => {
    dom.video.onloadeddata = () => resolve(true);
  });
  dom.video.srcObject = stream;
  void dom.video.play();
  await ready;
  dom.canvas.width = dom.video.videoWidth;
  dom.canvas.height = dom.video.videoHeight;
  dom.canvas.style.width = "50%";
  dom.canvas.style.height = "50%";
  if (human.env.initial)
    log2("video:", dom.video.videoWidth, dom.video.videoHeight, "|", stream.getVideoTracks()[0].label);
  dom.canvas.onclick = () => {
    if (dom.video.paused)
      void dom.video.play();
    else
      dom.video.pause();
  };
}
async function detectionLoop() {
  var _a;
  if (!dom.video.paused) {
    if ((_a = current.face) == null ? void 0 : _a.tensor)
      human.tf.dispose(current.face.tensor);
    await human.detect(dom.video);
    const now = human.now();
    ok.detectFPS.val = Math.round(1e4 / (now - timestamp.detect)) / 10;
    timestamp.detect = now;
    requestAnimationFrame(detectionLoop);
  }
}
function drawValidationTests() {
  let y = 32;
  for (const [key, val] of Object.entries(ok)) {
    let el = document.getElementById(`ok-${key}`);
    if (!el) {
      el = document.createElement("div");
      el.id = `ok-${key}`;
      el.innerText = key;
      el.className = "ok";
      el.style.top = `${y}px`;
      dom.ok.appendChild(el);
    }
    if (typeof val.status === "boolean")
      el.style.backgroundColor = val.status ? "lightgreen" : "lightcoral";
    const status = val.status ? "ok" : "fail";
    el.innerText = `${key}: ${val.val === 0 ? status : val.val}`;
    y += 28;
  }
}
async function validationLoop() {
  var _a;
  const interpolated = human.next(human.result);
  human.draw.canvas(dom.video, dom.canvas);
  await human.draw.all(dom.canvas, interpolated);
  const now = human.now();
  ok.drawFPS.val = Math.round(1e4 / (now - timestamp.draw)) / 10;
  timestamp.draw = now;
  ok.faceCount.val = human.result.face.length;
  ok.faceCount.status = ok.faceCount.val === 1;
  if (ok.faceCount.status) {
    const gestures = Object.values(human.result.gesture).map((gesture) => gesture.gesture);
    if (gestures.includes("blink left eye") || gestures.includes("blink right eye"))
      blink.start = human.now();
    if (blink.start > 0 && !gestures.includes("blink left eye") && !gestures.includes("blink right eye"))
      blink.end = human.now();
    ok.blinkDetected.status = ok.blinkDetected.status || Math.abs(blink.end - blink.start) > options.blinkMin && Math.abs(blink.end - blink.start) < options.blinkMax;
    if (ok.blinkDetected.status && blink.time === 0)
      blink.time = Math.trunc(blink.end - blink.start);
    ok.facingCenter.status = gestures.includes("facing center");
    ok.lookingCenter.status = gestures.includes("looking center");
    ok.faceConfidence.val = human.result.face[0].faceScore || human.result.face[0].boxScore || 0;
    ok.faceConfidence.status = ok.faceConfidence.val >= options.minConfidence;
    ok.antispoofCheck.val = human.result.face[0].real || 0;
    ok.antispoofCheck.status = ok.antispoofCheck.val >= options.minConfidence;
    ok.livenessCheck.val = human.result.face[0].live || 0;
    ok.livenessCheck.status = ok.livenessCheck.val >= options.minConfidence;
    ok.faceSize.val = Math.min(human.result.face[0].box[2], human.result.face[0].box[3]);
    ok.faceSize.status = ok.faceSize.val >= options.minSize;
    ok.descriptor.val = ((_a = human.result.face[0].embedding) == null ? void 0 : _a.length) || 0;
    ok.descriptor.status = ok.descriptor.val > 0;
    ok.age.val = human.result.face[0].age || 0;
    ok.age.status = ok.age.val > 0;
    ok.gender.val = human.result.face[0].genderScore || 0;
    ok.gender.status = ok.gender.val >= options.minConfidence;
  }
  ok.timeout.status = ok.elapsedMs.val <= options.maxTime;
  drawValidationTests();
  if (allOk() || !ok.timeout.status) {
    dom.video.pause();
    return human.result.face[0];
  }
  ok.elapsedMs.val = Math.trunc(human.now() - startTime);
  return new Promise((resolve) => {
    setTimeout(async () => {
      await validationLoop();
      resolve(human.result.face[0]);
    }, 30);
  });
}
async function saveRecords() {
  var _a, _b, _c, _d;
  if (dom.name.value.length > 0) {
    const image = (_a = dom.canvas.getContext("2d")) == null ? void 0 : _a.getImageData(0, 0, dom.canvas.width, dom.canvas.height);
    const rec = { id: 0, name: dom.name.value, descriptor: (_b = current.face) == null ? void 0 : _b.embedding, image };
    await save(rec);
    log2("saved face record:", rec.name, "descriptor length:", (_d = (_c = current.face) == null ? void 0 : _c.embedding) == null ? void 0 : _d.length);
    log2("known face records:", await count());
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
  var _a, _b, _c, _d;
  dom.canvas.style.height = "";
  (_a = dom.canvas.getContext("2d")) == null ? void 0 : _a.clearRect(0, 0, options.minSize, options.minSize);
  if (!((_b = current == null ? void 0 : current.face) == null ? void 0 : _b.tensor) || !((_c = current == null ? void 0 : current.face) == null ? void 0 : _c.embedding))
    return false;
  console.log("face record:", current.face);
  log2(`detected face: ${current.face.gender} ${current.face.age || 0}y distance ${current.face.iris || 0}cm/${Math.round(100 * (current.face.iris || 0) / 2.54) / 100}in`);
  human.tf.browser.toPixels(current.face.tensor, dom.canvas);
  if (await count() === 0) {
    log2("face database is empty: nothing to compare face with");
    document.body.style.background = "black";
    dom.delete.style.display = "none";
    return false;
  }
  const db2 = await load();
  const descriptors = db2.map((rec) => rec.descriptor).filter((desc) => desc.length > 0);
  const res = human.match(current.face.embedding, descriptors, matchOptions);
  current.record = db2[res.index] || null;
  if (current.record) {
    log2(`best match: ${current.record.name} | id: ${current.record.id} | similarity: ${Math.round(1e3 * res.similarity) / 10}%`);
    dom.name.value = current.record.name;
    dom.source.style.display = "";
    (_d = dom.source.getContext("2d")) == null ? void 0 : _d.putImageData(current.record.image, 0, 0);
  }
  document.body.style.background = res.similarity > options.threshold ? "darkgreen" : "maroon";
  return res.similarity > options.threshold;
}
async function main() {
  var _a, _b;
  ok.faceCount.status = false;
  ok.faceConfidence.status = false;
  ok.facingCenter.status = false;
  ok.blinkDetected.status = false;
  ok.faceSize.status = false;
  ok.antispoofCheck.status = false;
  ok.livenessCheck.status = false;
  ok.age.status = false;
  ok.gender.status = false;
  ok.elapsedMs.val = 0;
  dom.match.style.display = "none";
  dom.retry.style.display = "none";
  dom.source.style.display = "none";
  dom.canvas.style.height = "50%";
  document.body.style.background = "black";
  await webCam();
  await detectionLoop();
  startTime = human.now();
  current.face = await validationLoop();
  dom.canvas.width = ((_a = current.face.tensor) == null ? void 0 : _a.shape[1]) || options.minSize;
  dom.canvas.height = ((_b = current.face.tensor) == null ? void 0 : _b.shape[0]) || options.minSize;
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
  }
  return detectFace();
}
async function init() {
  var _a, _b;
  log2("human version:", human.version, "| tfjs version:", human.tf.version["tfjs-core"]);
  log2("options:", JSON.stringify(options).replace(/{|}|"|\[|\]/g, "").replace(/,/g, " "));
  log2("initializing webcam...");
  await webCam();
  log2("loading human models...");
  await human.load();
  log2("initializing human...");
  log2("face embedding model:", humanConfig.face.description.enabled ? "faceres" : "", ((_a = humanConfig.face["mobilefacenet"]) == null ? void 0 : _a.enabled) ? "mobilefacenet" : "", ((_b = humanConfig.face["insightface"]) == null ? void 0 : _b.enabled) ? "insightface" : "");
  log2("loading face database...");
  log2("known face records:", await count());
  dom.retry.addEventListener("click", main);
  dom.save.addEventListener("click", saveRecords);
  dom.delete.addEventListener("click", deleteRecord);
  await human.warmup();
  await main();
}
window.onload = init;
//# sourceMappingURL=index.js.map
