// @ts-nocheck // typescript checks disabled as this is pure javascript

/**
 * Human demo for browsers
 *
 * Demo for face mesh detection and projection as 3D object using Three.js
 */

import { DoubleSide, Mesh, MeshBasicMaterial, OrthographicCamera, Scene, sRGBEncoding, VideoTexture, WebGLRenderer, BufferGeometry, BufferAttribute } from '../helpers/three.js';
import { OrbitControls } from '../helpers/three-orbitControls.js';
import Human from '../../dist/human.esm.js'; // equivalent of @vladmandic/human

const userConfig = {
  backend: 'wasm',
  async: false,
  profile: false,
  warmup: 'full',
  modelBasePath: '../../models/',
  // wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.9.0/dist/',
  filter: { enabled: false },
  face: { enabled: true,
    detector: { rotation: false, maxDetected: 1 },
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

const wireframe = true; // enable wireframe overlay

const canvas = document.getElementById('canvas');
let width = 0;
let height = 0;

const renderer = new WebGLRenderer({ antialias: true, alpha: true, canvas });
renderer.setClearColor(0x000000);
renderer.outputEncoding = sRGBEncoding;
const camera = new OrthographicCamera();
const controls = new OrbitControls(camera, renderer.domElement); // pan&zoom controls
controls.enabled = true;
const materialWireFrame = new MeshBasicMaterial({ // create wireframe material
  color: 0xffaaaa,
  wireframe: true,
});
const materialFace = new MeshBasicMaterial({ // create material for mask
  color: 0xffffff,
  map: null, // will be created when the video is ready.
  side: DoubleSide,
});

class FaceGeometry extends BufferGeometry {
  constructor(triangulation) {
    super();
    this.positions = new Float32Array(478 * 3);
    this.uvs = new Float32Array(478 * 2);
    this.setAttribute('position', new BufferAttribute(this.positions, 3));
    this.setAttribute('uv', new BufferAttribute(this.uvs, 2));
    this.setIndex(triangulation);
  }

  update(face) {
    let ptr = 0;
    for (const p of face.mesh) {
      this.positions[ptr + 0] = -p[0] + width / 2;
      this.positions[ptr + 1] = height - p[1] - height / 2;
      this.positions[ptr + 2] = -p[2];
      ptr += 3;
    }
    ptr = 0;
    for (const p of face.meshRaw) {
      this.uvs[ptr + 0] = 0 + p[0];
      this.uvs[ptr + 1] = 1 - p[1];
      ptr += 2;
    }
    materialFace.map.update(); // update textures from video
    this.attributes.position.needsUpdate = true; // vertices
    this.attributes.uv.needsUpdate = true; // textures
    this.computeVertexNormals();
  }
}

const scene = new Scene();
const faceGeometry = new FaceGeometry(human.faceTriangulation); // create a new geometry helper
const mesh = new Mesh(faceGeometry, materialFace); // create mask mesh
scene.add(mesh);

function resize(input) {
  width = input.videoWidth;
  height = input.videoHeight;
  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.near = -100;
  camera.far = 100;
  camera.zoom = 2;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

const isLive = (input) => input.srcObject && (input.srcObject.getVideoTracks()[0].readyState === 'live') && (input.readyState > 2) && (!input.paused);

async function render(input) {
  if (isLive(input)) {
    if (width !== input.videoWidth || height !== input.videoHeight) resize(input); // resize orthographic camera to video dimensions if necessary
    const res = await human.detect(input);
    if (res?.face?.length > 0) {
      faceGeometry.update(res.face[0]);
      // render the mask
      mesh.material = materialFace;
      renderer.autoClear = true;
      renderer.render(scene, camera);
      if (wireframe) { // overlay wireframe
        mesh.material = materialWireFrame;
        renderer.autoClear = false;
        renderer.render(scene, camera);
      }
    }
  }
  requestAnimationFrame(() => render(input));
}

// setup webcam
async function setupCamera() {
  if (!navigator.mediaDevices) return null;
  const video = document.getElementById('video');
  canvas.addEventListener('click', () => {
    if (isLive(video)) video.pause();
    else video.play();
  });
  const constraints = {
    audio: false,
    video: { facingMode: 'user', resizeMode: 'crop-and-scale' },
  };
  if (window.innerWidth > window.innerHeight) constraints.video.width = { ideal: window.innerWidth };
  else constraints.video.height = { ideal: window.innerHeight };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  if (stream) video.srcObject = stream;
  else return null;
  // get information data
  const track = stream.getVideoTracks()[0];
  const settings = track.getSettings();
  // log('camera constraints:', constraints, 'window:', { width: window.innerWidth, height: window.innerHeight }, 'settings:', settings, 'track:', track);
  const engineData = human.tf.engine();
  const gpuData = (engineData.backendInstance && engineData.backendInstance.numBytesInGPU > 0) ? `gpu: ${(engineData.backendInstance.numBytesInGPU ? engineData.backendInstance.numBytesInGPU : 0).toLocaleString()} bytes` : '';
  const cameraData = { name: track.label?.toLowerCase(), width: settings.width, height: settings.height, facing: settings.facingMode === 'user' ? 'front' : 'back' };
  const memoryData = `system: ${engineData.state.numBytes.toLocaleString()} bytes ${gpuData} | tensors: ${engineData.state.numTensors.toLocaleString()}`;
  document.getElementById('log').innerHTML = `
  video: ${cameraData.name} | facing: ${cameraData.facing} | screen: ${window.innerWidth} x ${window.innerHeight} camera: ${cameraData.width} x ${cameraData.height}<br>
  backend: ${human.tf.getBackend()} | ${memoryData}<br>
  `;
  // return when camera is ready
  return new Promise((resolve) => {
    video.onloadeddata = async () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      canvas.width = video.width;
      canvas.height = video.height;
      video.play();
      resolve(video);
    };
  });
}

async function main() {
  window.addEventListener('unhandledrejection', (evt) => {
    // eslint-disable-next-line no-console
    console.error(evt.reason || evt);
    document.getElementById('log').innerHTML = evt?.reason?.message || evt?.reason || evt;
    evt.preventDefault();
  });

  await human.load();
  const video = await setupCamera();
  if (video) {
    const videoTexture = new VideoTexture(video); // now load textures from video
    videoTexture.encoding = sRGBEncoding;
    materialFace.map = videoTexture;
    render(video);
  }
}

window.onload = main;
