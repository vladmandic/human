// @ts-nocheck

import { DoubleSide, Mesh, MeshBasicMaterial, OrthographicCamera, Scene, sRGBEncoding, VideoTexture, WebGLRenderer, BufferGeometry, BufferAttribute, Vector3, Triangle, Matrix4 } from './helpers/three.js';
import { OrbitControls } from './helpers/three-orbitControls.js';
import Human from '../dist/human.esm.js'; // equivalent of @vladmandic/human

const userConfig = {
  backend: 'wasm',
  async: false,
  profile: false,
  warmup: 'full',
  videoOptimized: false,
  filter: { enabled: false },
  face: { enabled: true,
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: false },
    emotion: { enabled: false },
  },
  hand: { enabled: false },
  gesture: { enabled: false },
  body: { enabled: false },
  object: { enabled: false },
};
const human = new Human(userConfig);

class FaceGeometry extends BufferGeometry {
  constructor(inIndices, inUVMap) {
    super();
    this.indices = inIndices;
    this.texCoords = inUVMap;
    this.positions = new Float32Array(468 * 3);
    this.uvs = new Float32Array(468 * 2);
    this.setAttribute('position', new BufferAttribute(this.positions, 3));
    this.setAttribute('uv', new BufferAttribute(this.uvs, 2));
    this.setUvs();
    this.setIndex(this.indices);
    this.computeVertexNormals();
    this.applyMatrix4(new Matrix4().makeScale(10, 10, 10));
    this.p0 = new Vector3();
    this.p1 = new Vector3();
    this.p2 = new Vector3();
    this.triangle = new Triangle();
  }

  setUvs() {
    for (let j = 0; j < 468; j++) {
      this.uvs[j * 2] = this.texCoords[j][0];
      this.uvs[j * 2 + 1] = 1 - this.texCoords[j][1];
    }
    this.getAttribute('uv').needsUpdate = true;
  }

  setVideoUvs() {
    let ptr = 0;
    for (let j = 0; j < 468 * 2; j += 2) {
      this.uvs[j] = 1 - (this.positions[ptr] / this.w + 0.5);
      this.uvs[j + 1] = this.positions[ptr + 1] / this.h + 0.5;
      ptr += 3;
    }
    this.getAttribute('uv').needsUpdate = true;
  }

  setSize(w, h) {
    this.w = w;
    this.h = h;
  }

  update(face) {
    let ptr = 0;
    for (const p of face.mesh) {
      this.positions[ptr] = 1 - p[0] + 0.5 * this.w;
      this.positions[ptr + 1] = this.h - p[1] - 0.5 * this.h;
      this.positions[ptr + 2] = -p[2];
      ptr += 3;
    }
    this.setVideoUvs();
    this.attributes.position.needsUpdate = true;
    this.computeVertexNormals();
  }

  track(id0, id1, id2) {
    const points = this.positions;
    this.p0.set(points[id0 * 3], points[id0 * 3 + 1], points[id0 * 3 + 2]);
    this.p1.set(points[id1 * 3], points[id1 * 3 + 1], points[id1 * 3 + 2]);
    this.p2.set(points[id2 * 3], points[id2 * 3 + 1], points[id2 * 3 + 2]);
    this.triangle.set(this.p0, this.p1, this.p2);
    const center = new Vector3();
    this.triangle.getMidpoint(center);
    const normal = new Vector3();
    this.triangle.getNormal(normal);
    const matrix = new Matrix4();
    const x = this.p1.clone().sub(this.p2).normalize();
    const y = this.p1.clone().sub(this.p0).normalize();
    const z = new Vector3().crossVectors(x, y);
    const y2 = new Vector3().crossVectors(x, z).normalize();
    const z2 = new Vector3().crossVectors(x, y2).normalize();
    matrix.makeBasis(x, y2, z2);
    return { position: center, normal, rotation: matrix };
  }
}

const wireframe = true; // enable wireframe overlay

const canvas = document.getElementById('canvas');
let width = 0;
let height = 0;

const renderer = new WebGLRenderer({ antialias: true, alpha: true, canvas });
renderer.setClearColor(0x000000);
renderer.outputEncoding = sRGBEncoding;
const scene = new Scene();
const camera = new OrthographicCamera(1, 1, 1, 1, -1000, 1000);
const controls = new OrbitControls(camera, renderer.domElement); // pan&zoom controls
controls.enabled = true;
const materialWireFrame = new MeshBasicMaterial({ // create wireframe material
  color: 0xff00ff,
  wireframe: true,
});
const materialFace = new MeshBasicMaterial({ // create material for mask
  color: 0xffffff,
  map: null, // will be created when the video is ready.
  side: DoubleSide,
});
const faceGeometry = new FaceGeometry(human.faceTriangulation, human.faceUVMap); // create a new geometry helper
const mesh = new Mesh(faceGeometry, materialFace); // create mask mesh
scene.add(mesh);

function resize(input) {
  width = input.videoWidth;
  height = input.videoHeight;
  camera.left = -0.5 * width;
  camera.right = 0.5 * height;
  camera.top = 0.5 * width;
  camera.bottom = -0.5 * height;
  camera.updateProjectionMatrix();
  const videoAspectRatio = width / height;
  const windowAspectRatio = window.innerWidth / window.innerHeight;
  const adjustedWidth = videoAspectRatio > windowAspectRatio ? window.innerWidth : window.innerHeight * videoAspectRatio;
  const adjustedHeight = videoAspectRatio > windowAspectRatio ? window.innerWidth / videoAspectRatio : window.innerHeight;
  renderer.setSize(adjustedWidth, adjustedHeight);
  faceGeometry.setSize(width, height);
}

async function render(input) {
  const live = input.srcObject && (input.srcObject.getVideoTracks()[0].readyState === 'live') && (input.readyState > 2) && (!input.paused);
  if (!live) return;
  if (width !== input.videoWidth || height !== input.videoHeight) resize(input); // resize orthographic camera to video dimensions if necessary
  const res = await human.detect(input);
  if (res?.face?.length > 0) faceGeometry.update(res.face[0]);
  // render the mask
  mesh.material = materialFace;
  renderer.autoClear = true;
  renderer.render(scene, camera);
  if (wireframe) { // overlay wireframe
    mesh.material = materialWireFrame;
    renderer.autoClear = false;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(() => render(input));
}

// setup webcam
async function setupCamera() {
  const video = document.getElementById('video');
  if (!navigator.mediaDevices) return null;
  const constraints = {
    audio: false,
    video: { facingMode: 'user', resizeMode: 'crop-and-scale' },
  };
  if (window.innerWidth > window.innerHeight) constraints.video.width = { ideal: window.innerWidth };
  else constraints.video.height = { ideal: (window.innerHeight - document.getElementById('menubar').offsetHeight) };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  if (stream) video.srcObject = stream;
  else return null;
  return new Promise((resolve) => {
    video.onloadeddata = async () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      video.play();
      resolve(video);
    };
  });
}

async function init() {
  // await av.ready();
  const video = await setupCamera();
  const videoTexture = new VideoTexture(video); // load textures from video
  videoTexture.encoding = sRGBEncoding;
  materialFace.map = videoTexture;
  render(video);
}

window.onload = init;
