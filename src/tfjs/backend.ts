import { log, now } from '../helpers';
import * as humangl from './humangl';
import * as env from '../env';
import * as tf from '../../dist/tfjs.esm.js';

export async function check(instance) {
  if (env.env.initial || (instance.config.backend && (instance.config.backend.length > 0) && (tf.getBackend() !== instance.config.backend))) {
    const timeStamp = now();
    instance.state = 'backend';

    if (instance.config.backend && instance.config.backend.length > 0) {
      // detect web worker
      // @ts-ignore ignore missing type for WorkerGlobalScope as that is the point
      if (typeof window === 'undefined' && typeof WorkerGlobalScope !== 'undefined' && instance.config.debug) {
        if (instance.config.debug) log('running inside web worker');
      }

      // force browser vs node backend
      if (env.env.browser && instance.config.backend === 'tensorflow') {
        if (instance.config.debug) log('override: backend set to tensorflow while running in browser');
        instance.config.backend = 'humangl';
      }
      if (env.env.node && (instance.config.backend === 'webgl' || instance.config.backend === 'humangl')) {
        if (instance.config.debug) log(`override: backend set to ${instance.config.backend} while running in nodejs`);
        instance.config.backend = 'tensorflow';
      }

      // handle webgpu
      if (env.env.browser && instance.config.backend === 'webgpu') {
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
        instance.config.backend = env.env.node ? 'tensorflow' : 'humangl';
        if (instance.config.debug) log(`override: setting backend ${instance.config.backend}`);
      }

      if (instance.config.debug) log('setting backend:', instance.config.backend);

      // handle wasm
      if (instance.config.backend === 'wasm') {
        if (instance.config.debug) log('wasm path:', instance.config.wasmPath);
        if (typeof tf?.setWasmPaths !== 'undefined') await tf.setWasmPaths(instance.config.wasmPath);
        else throw new Error('wasm backend is not loaded');
        const simd = await tf.env().getAsync('WASM_HAS_SIMD_SUPPORT');
        const mt = await tf.env().getAsync('WASM_HAS_MULTITHREAD_SUPPORT');
        if (instance.config.debug) log(`wasm execution: ${simd ? 'SIMD' : 'no SIMD'} ${mt ? 'multithreaded' : 'singlethreaded'}`);
        if (instance.config.debug && !simd) log('warning: wasm simd support is not enabled');
      }

      try {
        await tf.setBackend(instance.config.backend);
        await tf.ready();
      } catch (err) {
        log('error: cannot set backend:', instance.config.backend, err);
        return false;
      }
    }

    // handle webgl & humangl
    if (tf.getBackend() === 'humangl') {
      tf.ENV.set('CHECK_COMPUTATION_FOR_ERRORS', false);
      tf.ENV.set('WEBGL_CPU_FORWARD', true);
      tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', false);
      tf.ENV.set('WEBGL_USE_SHAPES_UNIFORMS', true);
      // if (!instance.config.object.enabled) tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true); // safe to use 16bit precision
      if (typeof instance.config['deallocate'] !== 'undefined' && instance.config['deallocate']) { // hidden param
        log('changing webgl: WEBGL_DELETE_TEXTURE_THRESHOLD:', true);
        tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
      }
      // @ts-ignore getGPGPUContext only exists on WebGL backend
      const gl = await tf.backend().getGPGPUContext().gl;
      if (instance.config.debug) log(`gl version:${gl.getParameter(gl.VERSION)} renderer:${gl.getParameter(gl.RENDERER)}`);
    }

    // wait for ready
    tf.enableProdMode();
    await tf.ready();
    instance.performance.backend = Math.trunc(now() - timeStamp);
    instance.config.backend = tf.getBackend();

    env.get(); // update env on backend init
    instance.env = env.env;
  }
  return true;
}
