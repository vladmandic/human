/**
 * Custom TFJS backend for Human based on WebGL
 * Not used by default
 */

import { log } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';
import * as image from '../image/image';
import * as models from '../models';
// import { env } from '../env';

export const config = {
  name: 'humangl',
  priority: 999,
  canvas: <null | OffscreenCanvas | HTMLCanvasElement>null,
  gl: <null | WebGL2RenderingContext>null,
  extensions: <string[]> [],
  webGLattr: { // https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    depth: false,
    stencil: false,
    failIfMajorPerformanceCaveat: false,
    desynchronized: true,
  },
};

function extensions(): void {
  /*
  https://www.khronos.org/registry/webgl/extensions/
  https://webglreport.com/?v=2
  */
  const gl = config.gl;
  if (!gl) return;
  config.extensions = gl.getSupportedExtensions() as string[];
  // gl.getExtension('KHR_parallel_shader_compile');
}

/**
 * Registers custom WebGL2 backend to be used by Human library
 *
 * @returns void
 */
export async function register(instance): Promise<void> {
  // force backend reload if gl context is not valid
  if ((config.name in tf.engine().registry) && (!config.gl || !config.gl.getParameter(config.gl.VERSION))) {
    log('error: humangl backend invalid context');
    models.reset(instance);
    /*
    log('resetting humangl backend');
    await tf.removeBackend(config.name);
    await register(instance); // re-register
    */
  }
  if (!tf.findBackend(config.name)) {
    try {
      config.canvas = await image.canvas(100, 100);
    } catch (err) {
      log('error: cannot create canvas:', err);
      return;
    }
    try {
      config.gl = config.canvas?.getContext('webgl2', config.webGLattr) as WebGL2RenderingContext;
      if (config.canvas) {
        config.canvas.addEventListener('webglcontextlost', async (e) => {
          log('error: humangl:', e.type);
          // log('gpu memory usage:', instance.tf.engine().backendInstance.numBytesInGPU);
          log('possible browser memory leak using webgl');
          instance.emit('error');
          throw new Error('browser webgl error');
          /*
          log('resetting humangl backend');
          env.initial = true;
          models.reset(instance);
          await tf.removeBackend(config.name);
          await register(instance); // re-register
          */
        });
        config.canvas.addEventListener('webglcontextrestored', (e) => {
          log('error: humangl context restored:', e);
        });
        config.canvas.addEventListener('webglcontextcreationerror', (e) => {
          log('error: humangl context create:', e);
        });
      }
    } catch (err) {
      log('error: cannot get WebGL context:', err);
      return;
    }
    try {
      tf.setWebGLContext(2, config.gl);
    } catch (err) {
      log('error: cannot set WebGL context:', err);
      return;
    }
    const current = tf.backend().getGPGPUContext().gl;
    if (current) {
      log(`humangl webgl version:${current.getParameter(current.VERSION)} renderer:${current.getParameter(current.RENDERER)}`);
    } else {
      log('error: no current context:', current, config.gl);
    }
    try {
      const ctx = new tf.GPGPUContext(config.gl);
      tf.registerBackend(config.name, () => new tf.MathBackendWebGL(ctx), config.priority);
    } catch (err) {
      log('error: cannot register WebGL backend:', err);
      return;
    }
    try {
      const kernels = tf.getKernelsForBackend('webgl');
      kernels.forEach((kernelConfig) => {
        const newKernelConfig = { ...kernelConfig, backendName: config.name };
        tf.registerKernel(newKernelConfig);
      });
    } catch (err) {
      log('error: cannot update WebGL backend registration:', err);
      return;
    }
    try {
      tf.ENV.set('WEBGL_VERSION', 2);
    } catch (err) {
      log('error: cannot set WebGL backend flags:', err);
      return;
    }
    extensions();
    log('backend registered:', config.name);
  }
}
