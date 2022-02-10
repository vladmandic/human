/** TFJS backend initialization and customization */

import type { Human } from '../human';
import { log, now } from '../util/util';
import { env } from '../util/env';
import * as humangl from './humangl';
import * as tf from '../../dist/tfjs.esm.js';
import * as constants from './constants';

function registerCustomOps() {
  if (!env.kernels.includes('mod')) {
    const kernelMod = {
      kernelName: 'Mod',
      backendName: tf.getBackend(),
      kernelFunc: (op) => tf.tidy(() => tf.sub(op.inputs.a, tf.mul(tf.div(op.inputs.a, op.inputs.b), op.inputs.b))),
    };
    tf.registerKernel(kernelMod);
    env.kernels.push('mod');
  }
  if (!env.kernels.includes('floormod')) {
    const kernelMod = {
      kernelName: 'FloorMod',
      backendName: tf.getBackend(),
      kernelFunc: (op) => tf.tidy(() => tf.floorDiv(op.inputs.a / op.inputs.b) * op.inputs.b + tf.mod(op.inputs.a, op.inputs.b)),
    };
    tf.registerKernel(kernelMod);
    env.kernels.push('floormod');
  }
}

export async function check(instance: Human, force = false) {
  instance.state = 'backend';
  if (force || env.initial || (instance.config.backend && (instance.config.backend.length > 0) && (tf.getBackend() !== instance.config.backend))) {
    const timeStamp = now();

    if (instance.config.backend && instance.config.backend.length > 0) {
      // detect web worker
      // @ts-ignore ignore missing type for WorkerGlobalScope as that is the point
      if (typeof window === 'undefined' && typeof WorkerGlobalScope !== 'undefined' && instance.config.debug) {
        if (instance.config.debug) log('running inside web worker');
      }

      // force browser vs node backend
      if (env.browser && instance.config.backend === 'tensorflow') {
        if (instance.config.debug) log('override: backend set to tensorflow while running in browser');
        instance.config.backend = 'humangl';
      }
      if (env.node && (instance.config.backend === 'webgl' || instance.config.backend === 'humangl')) {
        if (instance.config.debug) log(`override: backend set to ${instance.config.backend} while running in nodejs`);
        instance.config.backend = 'tensorflow';
      }

      // handle webgpu
      if (env.browser && instance.config.backend === 'webgpu') {
        if (typeof navigator === 'undefined' || typeof navigator['gpu'] === 'undefined') {
          log('override: backend set to webgpu but browser does not support webgpu');
          instance.config.backend = 'humangl';
        } else {
          const adapter = await navigator['gpu'].requestAdapter();
          if (instance.config.debug) log('enumerated webgpu adapter:', adapter);
        }
      }

      // check available backends
      if (instance.config.backend === 'humangl') await humangl.register(instance);
      const available = Object.keys(tf.engine().registryFactory);
      if (instance.config.debug) log('available backends:', available);

      if (!available.includes(instance.config.backend)) {
        log(`error: backend ${instance.config.backend} not found in registry`);
        instance.config.backend = env.node ? 'tensorflow' : 'webgl';
        if (instance.config.debug) log(`override: setting backend ${instance.config.backend}`);
      }

      if (instance.config.debug) log('setting backend:', instance.config.backend);

      // customize wasm
      if (instance.config.backend === 'wasm') {
        if (instance.config.debug) log('wasm path:', instance.config.wasmPath);
        if (typeof tf?.setWasmPaths !== 'undefined') await tf.setWasmPaths(instance.config.wasmPath, instance.config.wasmPlatformFetch);
        else throw new Error('backend error: attempting to use wasm backend but wasm path is not set');
        const simd = await tf.env().getAsync('WASM_HAS_SIMD_SUPPORT');
        const mt = await tf.env().getAsync('WASM_HAS_MULTITHREAD_SUPPORT');
        if (instance.config.debug) log(`wasm execution: ${simd ? 'SIMD' : 'no SIMD'} ${mt ? 'multithreaded' : 'singlethreaded'}`);
        if (instance.config.debug && !simd) log('warning: wasm simd support is not enabled');
      }

      try {
        await tf.setBackend(instance.config.backend);
        await tf.ready();
        constants.init();
      } catch (err) {
        log('error: cannot set backend:', instance.config.backend, err);
        return false;
      }
    }

    // customize humangl
    if (tf.getBackend() === 'humangl') {
      tf.ENV.set('CHECK_COMPUTATION_FOR_ERRORS', false);
      tf.ENV.set('WEBGL_CPU_FORWARD', true);
      // tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', false);
      tf.ENV.set('WEBGL_USE_SHAPES_UNIFORMS', true);
      tf.ENV.set('CPU_HANDOFF_SIZE_THRESHOLD', 256);
      // if (!instance.config.object.enabled) tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true); // safe to use 16bit precision
      if (typeof instance.config['deallocate'] !== 'undefined' && instance.config['deallocate']) { // hidden param
        log('changing webgl: WEBGL_DELETE_TEXTURE_THRESHOLD:', true);
        tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
      }
      if (tf.backend().getGPGPUContext) {
        const gl = await tf.backend().getGPGPUContext().gl;
        if (instance.config.debug) log(`gl version:${gl.getParameter(gl.VERSION)} renderer:${gl.getParameter(gl.RENDERER)}`);
      }
    }

    // customize webgpu
    if (tf.getBackend() === 'webgpu') {
      // tf.ENV.set('WEBGPU_CPU_HANDOFF_SIZE_THRESHOLD', 512);
      // tf.ENV.set('WEBGPU_DEFERRED_SUBMIT_BATCH_SIZE', 0);
      // tf.ENV.set('WEBGPU_CPU_FORWARD', true);
    }

    // wait for ready
    tf.enableProdMode();
    await tf.ready();

    instance.performance.initBackend = Math.trunc(now() - timeStamp);
    instance.config.backend = tf.getBackend();

    await env.updateBackend(); // update env on backend init
    registerCustomOps();
    // await env.updateBackend(); // update env on backend init
  }
  return true;
}

// register fake missing tfjs ops
export function fakeOps(kernelNames: Array<string>, config) {
  // if (config.debug) log('registerKernel:', kernelNames);
  for (const kernelName of kernelNames) {
    const kernelConfig = {
      kernelName,
      backendName: config.backend,
      kernelFunc: () => { if (config.debug) log('kernelFunc', kernelName, config.backend); },
      // setupFunc: () => { if (config.debug) log('kernelFunc', kernelName, config.backend); },
      // disposeFunc: () => { if (config.debug) log('kernelFunc', kernelName, config.backend); },
    };
    tf.registerKernel(kernelConfig);
  }
  env.kernels = tf.getKernelsForBackend(tf.getBackend()).map((kernel) => kernel.kernelName.toLowerCase()); // re-scan registered ops
}
