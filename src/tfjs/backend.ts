/** TFJS backend initialization and customization */

import * as tf from 'dist/tfjs.esm.js';
import type { Human, Config, BackendEnum } from '../human';
import { log, now } from '../util/util';
import { env } from '../util/env';
import * as humangl from './humangl';
import * as constants from './constants';
import type { TensorInfo } from './types';

export async function getBestBackend(): Promise<BackendEnum> {
  await env.updateBackend(); // update env on backend init
  if (env.tensorflow?.version) return 'tensorflow';
  if (env.webgpu.supported && env.webgpu.backend) return 'webgpu';
  if (env.webgl.supported && env.webgl.backend) return 'webgl';
  if (env.wasm.supported && env.wasm.backend) return 'wasm';
  return 'cpu';
}

function registerCustomOps(config: Config) {
  const newKernels: string[] = [];
  if (!env.kernels.includes('mod')) {
    const kernelMod = {
      kernelName: 'Mod',
      backendName: tf.getBackend(),
      kernelFunc: (op) => tf.tidy(() => tf.sub(op.inputs.a, tf.mul(tf.div(op.inputs.a, op.inputs.b), op.inputs.b))),
    };
    tf.registerKernel(kernelMod);
    env.kernels.push('mod');
    newKernels.push('mod');
  }
  if (!env.kernels.includes('floormod')) {
    const kernelFloorMod = {
      kernelName: 'FloorMod',
      backendName: tf.getBackend(),
      kernelFunc: (op) => tf.tidy(() => tf.add(tf.mul(tf.floorDiv(op.inputs.a, op.inputs.b), op.inputs.b), tf.mod(op.inputs.a, op.inputs.b))),
    };
    tf.registerKernel(kernelFloorMod);
    env.kernels.push('floormod');
    newKernels.push('floormod');
  }
  /*
  if (!env.kernels.includes('atan2') && config.softwareKernels) {
    const kernelAtan2 = {
      kernelName: 'Atan2',
      backendName: tf.getBackend(),
      kernelFunc: (op) => tf.tidy(() => {
        const backend = tf.getBackend();
        tf.setBackend('cpu');
        const t = tf.atan2(op.inputs.a, op.inputs.b);
        tf.setBackend(backend);
        return t;
      }),
    };
    if (config.debug) log('registered kernel:', 'atan2');
    log('registered kernel:', 'atan2');
    tf.registerKernel(kernelAtan2);
    env.kernels.push('atan2');
    newKernels.push('atan2');
  }
  */
  if (!env.kernels.includes('rotatewithoffset') && config.softwareKernels) {
    const kernelRotateWithOffset = {
      kernelName: 'RotateWithOffset',
      backendName: tf.getBackend(),
      kernelFunc: (op) => tf.tidy(() => {
        const backend = tf.getBackend();
        tf.setBackend('cpu'); // eslint-disable-line @typescript-eslint/no-floating-promises
        const t = tf.image.rotateWithOffset(op.inputs.image, op.attrs.radians, op.attrs.fillValue, op.attrs.center);
        tf.setBackend(backend); // eslint-disable-line @typescript-eslint/no-floating-promises
        return t;
      }),
    };
    tf.registerKernel(kernelRotateWithOffset);
    env.kernels.push('rotatewithoffset');
    newKernels.push('rotatewithoffset');
  }
  if ((newKernels.length > 0) && config.debug) log('registered kernels:', newKernels);
}

let defaultFlags: Record<string, unknown> = {};

export async function check(instance: Human, force = false) {
  instance.state = 'backend';
  if (instance.config.backend?.length === 0) instance.config.backend = await getBestBackend();
  if (force || env.initial || (instance.config.backend && (instance.config.backend.length > 0) && (tf.getBackend() !== instance.config.backend))) {
    const timeStamp = now();

    if (instance.config.backend && instance.config.backend.length > 0) {
      // detect web worker
      // @ts-ignore ignore missing type for WorkerGlobalScope as that is the point
      if (typeof window === 'undefined' && typeof WorkerGlobalScope !== 'undefined' && instance.config.debug) {
        if (instance.config.debug) log('running inside web worker');
      }

      if (typeof navigator !== 'undefined' && navigator?.userAgent?.toLowerCase().includes('electron')) {
        if (instance.config.debug) log('running inside electron');
      }

      // check available backends
      let available = Object.keys(tf.engine().registryFactory as Record<string, unknown>);
      if (instance.config.backend === 'humangl' && !available.includes('humangl')) {
        humangl.register(instance);
        available = Object.keys(tf.engine().registryFactory as Record<string, unknown>);
      }
      if (instance.config.debug) log('available backends:', available);

      // force browser vs node backend
      if (env.browser && !env.node && (instance.config.backend === 'tensorflow') && available.includes('webgl')) {
        if (instance.config.debug) log('override: backend set to tensorflow while running in browser');
        instance.config.backend = 'webgl';
      }
      if (env.node && !env.browser && (instance.config.backend === 'webgl' || instance.config.backend === 'humangl') && available.includes('tensorflow')) {
        if (instance.config.debug) log(`override: backend set to ${instance.config.backend} while running in nodejs`);
        instance.config.backend = 'tensorflow';
      }

      // handle webgpu
      if (env.browser && instance.config.backend === 'webgpu') {
        if (typeof navigator === 'undefined' || typeof navigator.gpu === 'undefined') {
          log('override: backend set to webgpu but browser does not support webgpu');
          instance.config.backend = 'webgl';
        } else {
          const adapter: GPUAdapter = await navigator.gpu.requestAdapter() as GPUAdapter;
          if (instance.config.debug) log('enumerated webgpu adapter:', adapter);
          if (!adapter) {
            log('override: backend set to webgpu but browser reports no available gpu');
            instance.config.backend = 'webgl';
          } else {
            let adapterInfo;
            // @ts-ignore gpu adapter info
            if ('requestAdapterInfo' in adapter) adapterInfo = await adapter?.requestAdapterInfo();
            // @ts-ignore gpu adapter info
            else adapterInfo = adapter.info;
            // if (adapter.features) adapter.features.forEach((feature) => log('webgpu features:', feature));
            log('webgpu adapter info:', adapterInfo);
          }
        }
      }

      if (!available.includes(instance.config.backend)) {
        log(`error: backend ${instance.config.backend} not found in registry`);
        instance.config.backend = env.node ? 'tensorflow' : 'webgl';
        if (instance.config.debug) log(`override: setting backend ${instance.config.backend}`);
      }

      if (instance.config.debug) log('setting backend:', [instance.config.backend]);

      // customize wasm
      if (instance.config.backend === 'wasm') {
        // @ts-ignore private property
        if (tf.env().flagRegistry.CANVAS2D_WILL_READ_FREQUENTLY) tf.env().set('CANVAS2D_WILL_READ_FREQUENTLY', true);
        if (instance.config.debug) log('wasm path:', instance.config.wasmPath);
        if (typeof tf.setWasmPaths !== 'undefined') tf.setWasmPaths(instance.config.wasmPath, instance.config.wasmPlatformFetch);
        else throw new Error('backend error: attempting to use wasm backend but wasm path is not set');
        let mt = false;
        let simd = false;
        try {
          mt = await tf.env().getAsync('WASM_HAS_MULTITHREAD_SUPPORT') as boolean;
          simd = await tf.env().getAsync('WASM_HAS_SIMD_SUPPORT') as boolean;
          if (instance.config.debug) log(`wasm execution: ${simd ? 'simd' : 'no simd'} ${mt ? 'multithreaded' : 'singlethreaded'}`);
          if (instance.config.debug && !simd) log('warning: wasm simd support is not enabled');
        } catch {
          log('wasm detection failed');
        }
      }

      try {
        await tf.setBackend(instance.config.backend);
        await tf.ready();
      } catch (err) {
        log('error: cannot set backend:', instance.config.backend, err);
        return false;
      }
      // @ts-ignore private property
      if (instance.config.debug) defaultFlags = JSON.parse(JSON.stringify(tf.env().flags));
    }

    // customize humangl
    if (tf.getBackend() === 'humangl' || tf.getBackend() === 'webgl') {
      // @ts-ignore private property
      if (tf.env().flagRegistry.WEBGL_USE_SHAPES_UNIFORMS) tf.env().set('WEBGL_USE_SHAPES_UNIFORMS', true); // default=false <https://github.com/tensorflow/tfjs/issues/5205>
      // @ts-ignore private property
      if (tf.env().flagRegistry.WEBGL_EXP_CONV) tf.env().set('WEBGL_EXP_CONV', true); // default=false <https://github.com/tensorflow/tfjs/issues/6678>
      // if (tf.env().flagRegistry['WEBGL_PACK_DEPTHWISECONV'])  tf.env().set('WEBGL_PACK_DEPTHWISECONV', false); // default=true <https://github.com/tensorflow/tfjs/pull/4909>
      // if (tf.env().flagRegistry.USE_SETTIMEOUTCUSTOM) tf.env().set('USE_SETTIMEOUTCUSTOM', true); // default=false <https://github.com/tensorflow/tfjs/issues/6687>
      // if (tf.env().flagRegistry.CPU_HANDOFF_SIZE_THRESHOLD) tf.env().set('CPU_HANDOFF_SIZE_THRESHOLD', 1024); // default=1000
      // if (tf.env().flagRegistry['WEBGL_FORCE_F16_TEXTURES'] && !instance.config.object.enabled) tf.env().set('WEBGL_FORCE_F16_TEXTURES', true); // safe to use 16bit precision
      if (instance.config.debug && typeof instance.config.deallocate !== 'undefined' && instance.config.deallocate) { // hidden param
        log('changing webgl: WEBGL_DELETE_TEXTURE_THRESHOLD:', true);
        tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
      }
    }

    // customize webgpu
    if (tf.getBackend() === 'webgpu') {
      // if (tf.env().flagRegistry['WEBGPU_CPU_HANDOFF_SIZE_THRESHOLD']) tf.env().set('WEBGPU_CPU_HANDOFF_SIZE_THRESHOLD', 512);
      // if (tf.env().flagRegistry['WEBGPU_DEFERRED_SUBMIT_BATCH_SIZE']) tf.env().set('WEBGPU_DEFERRED_SUBMIT_BATCH_SIZE', 0);
      // if (tf.env().flagRegistry['WEBGPU_CPU_FORWARD']) tf.env().set('WEBGPU_CPU_FORWARD', true);
    }

    if (instance.config.debug) {
      // @ts-ignore private property
      const newFlags = tf.env().flags;
      const updatedFlags = {};
      for (const key of Object.keys(newFlags)) {
        if (defaultFlags[key] === newFlags[key]) continue;
        updatedFlags[key] = newFlags[key];
      }
      if (instance.config.debug && Object.keys(updatedFlags).length > 0) log('backend:', tf.getBackend(), 'flags:', updatedFlags);
    }

    if (instance.config.flags && Object.keys(instance.config.flags).length > 0) {
      if (instance.config.debug) log('flags:', instance.config['flags']);
      for (const [key, val] of Object.entries(instance.config.flags)) {
        tf.env().set(key, val as number | boolean);
      }
    }

    tf.enableProdMode();
    constants.init();
    instance.performance.initBackend = Math.trunc(now() - timeStamp);
    instance.config.backend = tf.getBackend() as BackendEnum;
    await env.updateBackend(); // update env on backend init
    registerCustomOps(instance.config);
    // await env.updateBackend(); // update env on backend init
    // env.initial = false;
  }
  return true;
}

// register fake missing tfjs ops
export function fakeOps(kernelNames: string[], config) {
  // if (config.debug) log('registerKernel:', kernelNames);
  for (const kernelName of kernelNames) {
    const kernelConfig = {
      kernelName,
      backendName: config.backend,
      kernelFunc: (param): TensorInfo => {
        if (config.debug) log('kernelFunc', kernelName, config.backend, param);
        return param?.inputs?.info as TensorInfo;
      },
      // setupFunc: () => { if (config.debug) log('kernelFunc', kernelName, config.backend); },
      // disposeFunc: () => { if (config.debug) log('kernelFunc', kernelName, config.backend); },
    };
    tf.registerKernel(kernelConfig);
  }
  env.kernels = tf.getKernelsForBackend(tf.getBackend()).map((kernel) => kernel.kernelName.toLowerCase()); // re-scan registered ops
}
