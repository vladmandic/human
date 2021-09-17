import * as tf from '../dist/tfjs.esm.js';
import * as image from './image/image';

export interface Env {
  browser: undefined | boolean,
  node: undefined | boolean,
  worker: undefined | boolean,
  platform: undefined | string,
  agent: undefined | string,
  backends: string[],
  initial: boolean,
  tfjs: {
    version: undefined | string,
  },
  wasm: {
    supported: undefined | boolean,
    backend: undefined | boolean,
    simd: undefined | boolean,
    multithread: undefined | boolean,
  },
  webgl: {
    supported: undefined | boolean,
    backend: undefined | boolean,
    version: undefined | string,
    renderer: undefined | string,
  },
  webgpu: {
    supported: undefined | boolean,
    backend: undefined | boolean,
    adapter: undefined | string,
  },
  kernels: string[],
  Canvas: undefined,
  Image: undefined,
}

export const env: Env = {
  browser: undefined,
  node: undefined,
  worker: undefined,
  platform: undefined,
  agent: undefined,
  initial: true,
  backends: [],
  tfjs: {
    version: undefined,
  },
  wasm: {
    supported: undefined,
    backend: undefined,
    simd: undefined,
    multithread: undefined,
  },
  webgl: {
    supported: undefined,
    backend: undefined,
    version: undefined,
    renderer: undefined,
  },
  webgpu: {
    supported: undefined,
    backend: undefined,
    adapter: undefined,
  },
  kernels: [],
  Canvas: undefined,
  Image: undefined,
};

export async function cpuInfo() {
  const cpu = { model: '', flags: [] };
  if (env.node && env.platform?.startsWith('linux')) {
    // eslint-disable-next-line global-require
    const fs = require('fs');
    try {
      const data = fs.readFileSync('/proc/cpuinfo').toString();
      for (const line of data.split('\n')) {
        if (line.startsWith('model name')) {
          cpu.model = line.match(/:(.*)/g)[0].replace(':', '').trim();
        }
        if (line.startsWith('flags')) {
          cpu.flags = line.match(/:(.*)/g)[0].replace(':', '').trim().split(' ').sort();
        }
      }
    } catch { /**/ }
  }
  if (!env['cpu']) Object.defineProperty(env, 'cpu', { value: cpu });
  else env['cpu'] = cpu;
}

export async function backendInfo() {
  // analyze backends
  env.backends = Object.keys(tf.engine().registryFactory);
  env.wasm.supported = typeof WebAssembly !== 'undefined';
  env.wasm.backend = env.backends.includes('wasm');
  if (env.wasm.supported && env.wasm.backend && tf.getBackend() === 'wasm') {
    env.wasm.simd = await tf.env().getAsync('WASM_HAS_SIMD_SUPPORT');
    env.wasm.multithread = await tf.env().getAsync('WASM_HAS_MULTITHREAD_SUPPORT');
  }

  const c = image.canvas(100, 100);
  const ctx = c ? c.getContext('webgl2') : undefined; // causes too many gl contexts
  // const ctx = typeof tf.backend().getGPGPUContext !== undefined ? tf.backend().getGPGPUContext : null;
  env.webgl.supported = typeof ctx !== 'undefined';
  env.webgl.backend = env.backends.includes('webgl');
  if (env.webgl.supported && env.webgl.backend && (tf.getBackend() === 'webgl' || tf.getBackend() === 'humangl')) {
    // @ts-ignore getGPGPUContext only exists on WebGL backend
    const gl = tf.backend().gpgpu !== 'undefined' ? await tf.backend().getGPGPUContext().gl : null;
    if (gl) {
      env.webgl.version = gl.getParameter(gl.VERSION);
      env.webgl.renderer = gl.getParameter(gl.RENDERER);
    }
  }

  env.webgpu.supported = env.browser && typeof navigator['gpu'] !== 'undefined';
  env.webgpu.backend = env.backends.includes('webgpu');
  if (env.webgpu.supported) env.webgpu.adapter = (await navigator['gpu'].requestAdapter())?.name;

  // enumerate kernels
  env.kernels = tf.getKernelsForBackend(tf.getBackend()).map((kernel) => kernel.kernelName.toLowerCase());
}

export async function get() {
  env.browser = typeof navigator !== 'undefined';
  env.node = typeof process !== 'undefined';
  // @ts-ignore WorkerGlobalScope evaluated in browser only
  env.worker = env.browser ? (typeof WorkerGlobalScope !== 'undefined') : undefined;
  env.tfjs.version = tf.version_core;

  // get platform and agent
  if (typeof navigator !== 'undefined') {
    const raw = navigator.userAgent.match(/\(([^()]+)\)/g);
    if (raw && raw[0]) {
      const platformMatch = raw[0].match(/\(([^()]+)\)/g);
      env.platform = (platformMatch && platformMatch[0]) ? platformMatch[0].replace(/\(|\)/g, '') : '';
      env.agent = navigator.userAgent.replace(raw[0], '');
      if (env.platform[1]) env.agent = env.agent.replace(raw[1], '');
      env.agent = env.agent.replace(/  /g, ' ');
    }
  } else if (typeof process !== 'undefined') {
    env.platform = `${process.platform} ${process.arch}`;
    env.agent = `NodeJS ${process.version}`;
  }

  await backendInfo();

  // get cpu info
  // await cpuInfo();
}
