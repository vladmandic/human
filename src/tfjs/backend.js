import * as tf from '../../dist/tfjs.esm.js';

export const config = {
  name: 'humangl',
  priority: 99,
  canvas: null,
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
    // @ts-ignore
    config.canvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(config.width, config.height) : document.createElement('canvas');
    // @ts-ignore
    const gl = config.canvas.getContext('webgl2', config.webGLattr);
    tf.setWebGLContext(2, gl);
    const ctx = new tf.GPGPUContext(gl);
    tf.registerBackend(config.name, () => new tf.MathBackendWebGL(ctx), config.priority);
    const kernels = tf.getKernelsForBackend('webgl');
    kernels.forEach((kernelConfig) => {
      const newKernelConfig = { ...kernelConfig, backendName: config.name };
      tf.registerKernel(newKernelConfig);
    });
    tf.ENV.set('WEBGL_VERSION', 2);
    tf.ENV.set('WEBGL_MAX_TEXTURE_SIZE', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true);
    tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', true);
  }
}
