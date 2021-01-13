import { log } from '../log.js';
import * as tf from '../../dist/tfjs.esm.js';

export const config = {
  name: 'humangl',
  priority: 99,
  canvas: null,
  gl: null,
  width: 1024,
  height: 1024,
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

export function register() {
  if (!tf.findBackend(config.name)) {
    log('backend registration:', config.name);
    try {
      config.canvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(config.width, config.height) : document.createElement('canvas');
    } catch (err) {
      log('error: cannot create canvas:', err);
      return;
    }
    try {
      config.gl = config.canvas.getContext('webgl2', config.webGLattr);
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
      tf.ENV.set('WEBGL_MAX_TEXTURE_SIZE', config.gl.getParameter(config.gl.MAX_TEXTURE_SIZE));
      tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true);
      tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', true);
    } catch (err) {
      log('error: cannot set WebGL backend flags:', err);
      return;
    }
    log('backend registered:', config.name);
  }
}
