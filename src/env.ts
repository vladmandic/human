import * as tf from '../dist/tfjs.esm.js';

export interface Env {
  browser: undefined | boolean,
  node: undefined | boolean,
  worker: undefined | boolean,
  platform: undefined | string,
  agent: undefined | string,
  backends: string[],
  tfjs: {
    version: undefined | string,
    external: undefined | boolean,
  },
  wasm: {
    supported: undefined | boolean,
    simd: undefined | boolean,
    multithread: undefined | boolean,
  },
  webgl: {
    supported: undefined | boolean,
    version: undefined | string,
    renderer: undefined | string,
  },
  webgpu: {
    supported: undefined | boolean,
    adapter: undefined | string,
  },
  kernels: string[],
}

export const env: Env = {
  browser: undefined,
  node: undefined,
  worker: undefined,
  platform: undefined,
  agent: undefined,
  backends: [],
  tfjs: {
    version: undefined,
    external: undefined,
  },
  wasm: {
    supported: undefined,
    simd: undefined,
    multithread: undefined,
  },
  webgl: {
    supported: undefined,
    version: undefined,
    renderer: undefined,
  },
  webgpu: {
    supported: undefined,
    adapter: undefined,
  },
  kernels: [],
};

export function cpuinfo() {
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

  // analyze backends
  env.backends = Object.keys(tf.engine().registryFactory);
  env.wasm.supported = env.backends.includes('wasm');
  if (env.wasm.supported) {
    env.wasm.simd = await tf.env().getAsync('WASM_HAS_SIMD_SUPPORT');
    env.wasm.multithread = await tf.env().getAsync('WASM_HAS_MULTITHREAD_SUPPORT');
  }

  env.webgl.supported = typeof tf.backend().gpgpu !== 'undefined';
  if (env.webgl.supported) {
    // @ts-ignore getGPGPUContext only exists on WebGL backend
    const gl = await tf.backend().getGPGPUContext().gl;
    if (gl) {
      env.webgl.version = gl.getParameter(gl.VERSION);
      env.webgl.renderer = gl.getParameter(gl.RENDERER);
    }
  }

  env.webgpu.supported = env.browser && typeof navigator['gpu'] !== 'undefined';
  if (env.webgpu.supported) env.webgpu.adapter = (await navigator['gpu'].requestAdapter())?.name;

  // enumerate kernels
  env.kernels = tf.getKernelsForBackend(tf.getBackend()).map((kernel) => kernel.kernelName.toLowerCase());

  // get cpu info
  // cpuinfo();
}
