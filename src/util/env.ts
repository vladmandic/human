import * as tf from '../../dist/tfjs.esm.js';
import * as image from '../image/image';

/** Env class that holds detected capabilities */
export class Env {
  /** Running in Browser */
  browser: boolean;
  /** Running in NodeJS */
  node: boolean;
  /** Running in WebWorker thread */
  worker: boolean;
  /** Detected platform */
  platform: string = '';
  /** Detected agent */
  agent: string = '';
  /** List of supported backends */
  backends: string[] = [];
  /** Has any work been performed so far */
  initial: boolean;
  /** Are image filters supported? */
  filter: boolean | undefined;
  /** TFJS instance details */
  tfjs: {
    version: undefined | string,
  };
  /** Is offscreenCanvas supported? */
  offscreen: undefined | boolean;
  /** Are performance counter instant values or additive */
  perfadd: boolean = false;
  /** If using tfjs-node get version of underlying tensorflow shared library and if gpu acceleration is enabled */
  tensorflow: {
    version: undefined | string,
    gpu: undefined | boolean,
  } = {
      version: undefined,
      gpu: undefined,
    };
  /** WASM detected capabilities */
  wasm: {
    supported: undefined | boolean,
    backend: undefined | boolean,
    simd: undefined | boolean,
    multithread: undefined | boolean,
  } = {
      supported: undefined,
      backend: undefined,
      simd: undefined,
      multithread: undefined,
    };
  /** WebGL detected capabilities */
  webgl: {
    supported: undefined | boolean,
    backend: undefined | boolean,
    version: undefined | string,
    renderer: undefined | string,
  } = {
      supported: undefined,
      backend: undefined,
      version: undefined,
      renderer: undefined,
    };
  /** WebGPU detected capabilities */
  webgpu: {
    supported: undefined | boolean,
    backend: undefined | boolean,
    adapter: undefined | string,
  } = {
      supported: undefined,
      backend: undefined,
      adapter: undefined,
    };
  /** CPU info */
  cpu: {
    model: undefined | string,
    flags: string[],
  } = {
      model: undefined,
      flags: [],
    };
  /** List of supported kernels for current backend */
  kernels: string[] = [];
  /** MonkeyPatch for Canvas */
  Canvas: undefined;
  /** MonkeyPatch for Image */
  Image: undefined;
  /** MonkeyPatch for ImageData */
  ImageData: undefined;

  constructor() {
    this.browser = typeof navigator !== 'undefined';
    this.node = (typeof process !== 'undefined') && (typeof process.versions !== 'undefined') && (typeof process.versions.node !== 'undefined');
    this.tfjs = { version: tf.version['tfjs-core'] };
    this.offscreen = typeof OffscreenCanvas !== 'undefined';
    this.initial = true;

    // @ts-ignore WorkerGlobalScope evaluated in browser only
    this.worker = this.browser && this.offscreen ? (typeof WorkerGlobalScope !== 'undefined') : undefined;
    if (typeof navigator !== 'undefined') {
      const raw = navigator.userAgent.match(/\(([^()]+)\)/g);
      if (raw?.[0]) {
        const platformMatch = raw[0].match(/\(([^()]+)\)/g);
        this.platform = (platformMatch?.[0]) ? platformMatch[0].replace(/\(|\)/g, '') : '';
        this.agent = navigator.userAgent.replace(raw[0], '');
        if (this.platform[1]) this.agent = this.agent.replace(raw[1], '');
        this.agent = this.agent.replace(/  /g, ' ');
        // chrome offscreencanvas gpu memory leak
        /*
        const isChrome = env.agent.match(/Chrome\/.[0-9]/g);
        const verChrome = isChrome && isChrome[0] ? isChrome[0].split('/')[1] : 0;
        if (verChrome > 92 && verChrome < 96) {
          log('disabling offscreenCanvas due to browser error:', isChrome ? isChrome[0] : 'unknown');
          this.offscreen = false;
        }
        */
      }
    } else if (typeof process !== 'undefined') {
      this.platform = `${process.platform} ${process.arch}`;
      this.agent = `NodeJS ${process.version}`;
    }
  }

  /** update backend information */
  async updateBackend() {
    // analyze backends
    this.backends = Object.keys(tf.engine().registryFactory);
    this.tensorflow = {
      version: (tf.backend().binding ? tf.backend().binding.TF_Version : undefined),
      gpu: (tf.backend().binding ? tf.backend().binding.isUsingGpuDevice() : undefined),
    };
    this.wasm.supported = typeof WebAssembly !== 'undefined';
    this.wasm.backend = this.backends.includes('wasm');
    if (this.wasm.supported && this.wasm.backend && tf.getBackend() === 'wasm') {
      this.wasm.simd = tf.env().get('WASM_HAS_SIMD_SUPPORT');
      this.wasm.multithread = tf.env().get('WASM_HAS_MULTITHREAD_SUPPORT');
    }
    const c = image.canvas(100, 100);
    const ctx = c ? c.getContext('webgl2') : undefined; // causes too many gl contexts
    // const ctx = typeof tf.backend().getGPGPUContext !== undefined ? tf.backend().getGPGPUContext : null;
    this.webgl.supported = typeof ctx !== 'undefined';
    this.webgl.backend = this.backends.includes('webgl');
    if (this.webgl.supported && this.webgl.backend && (tf.getBackend() === 'webgl' || tf.getBackend() === 'humangl')) {
      const gl = tf.backend().gpgpu !== 'undefined' ? await tf.backend().getGPGPUContext().gl : null;
      if (gl) {
        this.webgl.version = gl.getParameter(gl.VERSION);
        this.webgl.renderer = gl.getParameter(gl.RENDERER);
      }
    }
    this.webgpu.supported = this.browser && typeof navigator.gpu !== 'undefined';
    this.webgpu.backend = this.backends.includes('webgpu');
    try {
      if (this.webgpu.supported) {
        const adapter = await navigator.gpu.requestAdapter();
        this.webgpu.adapter = adapter ? adapter.name : undefined;
      }
    } catch {
      this.webgpu.supported = false;
    }
    try {
      this.kernels = tf.getKernelsForBackend(tf.getBackend()).map((kernel) => (kernel.kernelName as string).toLowerCase());
    } catch { /**/ }
  }

  /** update cpu information */
  updateCPU() {
    const cpu = { model: '', flags: [] };
    if (this.node && this.platform.startsWith('linux')) {
      /*
      const fs = require('fs');
      try {
        const data = fs.readFileSync('/proc/cpuinfo').toString();
        for (const line of data.split('\n')) {
          if (line.startsWith('model name')) cpu.model = line.match(/:(.*)/g)[0].replace(':', '').trim();
          if (line.startsWith('flags')) cpu.flags = line.match(/:(.*)/g)[0].replace(':', '').trim().split(' ').sort();
        }
      } catch { }
      */
    }
    if (!this.cpu) Object.defineProperty(this, 'cpu', { value: cpu });
    else this.cpu = cpu;
  }
}

export const env = new Env();
