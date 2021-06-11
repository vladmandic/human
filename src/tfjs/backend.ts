/**
 * Custom TFJS backend for Human based on WebGL
 * Not used by default
 */

import { log } from '../helpers';
import * as tf from '../../dist/tfjs.esm.js';

export const config = {
  name: 'humangl',
  priority: 99,
  canvas: <null | OffscreenCanvas | HTMLCanvasElement>null,
  gl: <null | WebGL2RenderingContext>null,
  width: 1024,
  height: 1024,
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
export function register(): void {
  if (!tf.findBackend(config.name)) {
    // log('backend registration:', config.name);
    try {
      config.canvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(config.width, config.height) : document.createElement('canvas');
    } catch (err) {
      log('error: cannot create canvas:', err);
      return;
    }
    try {
      config.gl = config.canvas.getContext('webgl2', config.webGLattr) as WebGL2RenderingContext;
    } catch (err) {
      log('error: cannot get WebGL2 context:', err);
      return;
    }
    try {
      tf.setWebGLContext(2, config.gl);
    } catch (err) {
      log('error: cannot set WebGL2 context:', err);
      return;
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
