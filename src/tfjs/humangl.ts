/** TFJS custom backend registration */

import * as tf from 'dist/tfjs.esm.js';
import type { Human } from '../human';
import { log } from '../util/util';
import * as image from '../image/image';
import type { AnyCanvas } from '../exports';

export const config = {
  name: 'humangl',
  priority: 999,
  canvas: null as null | AnyCanvas,
  gl: null as null | WebGL2RenderingContext,
  extensions: [] as string[] | null,
  webGLattr: { // https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    depth: false,
    stencil: false,
    failIfMajorPerformanceCaveat: false, // default=true
    desynchronized: true, // default=undefined
  },
};

function extensions(): void {
  /*
  https://www.khronos.org/registry/webgl/extensions/
  https://webglreport.com/?v=2
  */
  const gl = config.gl;
  if (!gl) return;
  config.extensions = gl.getSupportedExtensions();
  // gl.getExtension('KHR_parallel_shader_compile');
}

/**
 * Registers custom WebGL2 backend to be used by Human library
 *
 * @returns void
 */
export function register(instance: Human): void {
  // force backend reload if gl context is not valid
  if (instance.config.backend !== 'humangl') return;
  if ((config.name in tf.engine().registry) && !config?.gl?.getParameter(config.gl.VERSION)) {
    log('humangl error: backend invalid context');
    instance.models.reset();
    /*
    log('resetting humangl backend');
    await tf.removeBackend(config.name);
    await register(instance); // re-register
    */
  }
  if (!tf.findBackend(config.name)) {
    try {
      config.canvas = image.canvas(100, 100);
    } catch (err) {
      log('humangl error: cannot create canvas:', err);
      return;
    }
    try {
      config.gl = config.canvas.getContext('webgl2', config.webGLattr) as WebGL2RenderingContext;
      if (!config.gl) {
        log('humangl error: cannot get webgl context');
        return;
      }
      const glv2 = config.gl.getParameter(config.gl.VERSION).includes('2.0');
      if (!glv2) {
        log('backend override: using fallback webgl backend as webgl 2.0 is not detected');
        instance.config.backend = 'webgl';
        return;
      }
      if (config.canvas) {
        config.canvas.addEventListener('webglcontextlost', (e) => {
          log('humangl error:', e.type);
          log('possible browser memory leak using webgl or conflict with multiple backend registrations');
          instance.emit('error');
          throw new Error('backend error: webgl context lost');
        });
        config.canvas.addEventListener('webglcontextrestored', (e) => {
          log('humangl error: context restored:', e);
        });
        config.canvas.addEventListener('webglcontextcreationerror', (e) => {
          log('humangl error: context create:', e);
        });
      }
    } catch (err) {
      log('humangl error: cannot get webgl context:', err);
      return;
    }
    try {
      tf.setWebGLContext(2, config.gl);
    } catch (err) {
      log('humangl error: cannot set webgl context:', err);
      return;
    }
    try {
      const ctx = new tf.GPGPUContext(config.gl);
      // @ts-ignore uncompatible kernelMs timing info
      tf.registerBackend(config.name, () => new tf.MathBackendWebGL(ctx), config.priority);
    } catch (err) {
      log('humangl error: cannot register webgl backend:', err);
      return;
    }
    try {
      const kernels = tf.getKernelsForBackend('webgl');
      kernels.forEach((kernelConfig) => {
        const newKernelConfig = { ...kernelConfig, backendName: config.name };
        tf.registerKernel(newKernelConfig);
      });
    } catch (err) {
      log('humangl error: cannot update webgl backend registration:', err);
      return;
    }
    try {
      // @ts-ignore private property
      if (tf.env().flagRegistry.WEBGL_VERSION) tf.env().set('WEBGL_VERSION', 2);
    } catch (err) {
      log('humangl error: cannot set WebGL backend flags:', err);
      return;
    }
    extensions();
    const backend = tf.backend();
    const current = typeof backend['gpgpu'] !== 'undefined' ? backend['getGPGPUContext']().gl : null;
    if (current) {
      if (instance.config.debug) log('humangl backend registered:', { webgl: current.getParameter(current.VERSION) as string, renderer: current.getParameter(current.RENDERER) as string });
    } else {
      log('humangl error: no current gl context:', current, config.gl);
    }
  }
}
