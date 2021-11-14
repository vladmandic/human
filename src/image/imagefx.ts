/**
 * Image Filters in WebGL algoritm implementation
 * Based on: [WebGLImageFilter](https://github.com/phoboslab/WebGLImageFilter)
 */

import * as shaders from './imagefxshaders';
import { canvas } from './image';
import { log } from '../util/util';

const collect = (source, prefix, collection) => {
  const r = new RegExp('\\b' + prefix + ' \\w+ (\\w+)', 'ig');
  source.replace(r, (match, name) => {
    collection[name] = 0;
    return match;
  });
};

class GLProgram {
  uniform = {};
  attribute = {};
  gl: WebGLRenderingContext;
  id: WebGLProgram;

  constructor(gl, vertexSource, fragmentSource) {
    this.gl = gl;
    const vertexShader = this.compile(vertexSource, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compile(fragmentSource, this.gl.FRAGMENT_SHADER);
    this.id = this.gl.createProgram() as WebGLProgram;
    if (!vertexShader || !fragmentShader) return;
    if (!this.id) {
      log('filter: could not create webgl program');
      return;
    }
    this.gl.attachShader(this.id, vertexShader);
    this.gl.attachShader(this.id, fragmentShader);
    this.gl.linkProgram(this.id);
    if (!this.gl.getProgramParameter(this.id, this.gl.LINK_STATUS)) {
      log(`filter: gl link failed: ${this.gl.getProgramInfoLog(this.id)}`);
      return;
    }
    this.gl.useProgram(this.id);
    collect(vertexSource, 'attribute', this.attribute); // Collect attributes
    for (const a in this.attribute) this.attribute[a] = this.gl.getAttribLocation(this.id, a);
    collect(vertexSource, 'uniform', this.uniform); // Collect uniforms
    collect(fragmentSource, 'uniform', this.uniform);
    for (const u in this.uniform) this.uniform[u] = this.gl.getUniformLocation(this.id, u);
  }

  compile = (source, type): WebGLShader | null => {
    const shader = this.gl.createShader(type) as WebGLShader;
    if (!shader) {
      log('filter: could not create shader');
      return null;
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      log(`filter: gl compile failed: ${this.gl.getShaderInfoLog(shader)}`);
      return null;
    }
    return shader;
  };
}

// function that is instantiated as class so it has private this members
/**
 * @class GLImageFilter
 * @property {function} reset reset current filter chain
 * @property {function} add add specified filter to filter chain
 * @property {function} apply execute filter chain and draw result
 * @property {function} draw just draw input to result
 */

export function GLImageFilter() {
  let drawCount = 0;
  let sourceTexture: WebGLTexture | null = null;
  let lastInChain = false;
  let currentFramebufferIndex = -1;
  let tempFramebuffers: [null, null] | [{ fbo: WebGLFramebuffer | null, texture: WebGLTexture | null }] = [null, null];
  let filterChain: Record<string, unknown>[] = [];
  let vertexBuffer: WebGLBuffer | null = null;
  let currentProgram: GLProgram | null = null;
  const fxcanvas = canvas(100, 100);
  const shaderProgramCache = { }; // key is the shader program source, value is the compiled program
  const DRAW = { INTERMEDIATE: 1 };
  const gl = fxcanvas.getContext('webgl') as WebGLRenderingContext;
  // @ts-ignore used for sanity checks outside of imagefx
  this.gl = gl;
  if (!gl) {
    log('filter: cannot get webgl context');
    return;
  }

  function resize(width, height) {
    if (width === fxcanvas.width && height === fxcanvas.height) return; // Same width/height? Nothing to do here
    fxcanvas.width = width;
    fxcanvas.height = height;
    if (!vertexBuffer) { // Create the context if we don't have it yet
      const vertices = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0]); // Create the vertex buffer for the two triangles [x, y, u, v] * 6
      vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    }
    gl.viewport(0, 0, fxcanvas.width, fxcanvas.height);
    tempFramebuffers = [null, null]; // Delete old temp framebuffers
  }

  function createFramebufferTexture(width, height) {
    const fbo = gl.createFramebuffer() as WebGLFramebuffer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    const renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    const texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo, texture };
  }

  function getTempFramebuffer(index): { fbo: WebGLFramebuffer | null, texture: WebGLTexture | null } {
    tempFramebuffers[index] = tempFramebuffers[index] || createFramebufferTexture(fxcanvas.width, fxcanvas.height);
    return tempFramebuffers[index] as { fbo: WebGLFramebuffer, texture: WebGLTexture };
  }

  function draw(flags = 0) {
    if (!currentProgram) return;
    let source: WebGLTexture | null = null;
    let target: WebGLFramebuffer | null = null;
    let flipY = false;
    if (drawCount === 0) source = sourceTexture; // First draw call - use the source texture
    else source = getTempFramebuffer(currentFramebufferIndex).texture || null; // All following draw calls use the temp buffer last drawn to
    drawCount++;
    if (lastInChain && !(flags & DRAW.INTERMEDIATE)) { // Last filter in our chain - draw directly to the WebGL Canvas. We may also have to flip the image vertically now
      target = null;
      flipY = drawCount % 2 === 0;
    } else {
      currentFramebufferIndex = (currentFramebufferIndex + 1) % 2;
      target = getTempFramebuffer(currentFramebufferIndex).fbo || null; // Intermediate draw call - get a temp buffer to draw to
    }
    gl.bindTexture(gl.TEXTURE_2D, source); // Bind the source and target and draw the two triangles
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.uniform1f(currentProgram.uniform['flipY'], (flipY ? -1 : 1));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function compileShader(fragmentSource): GLProgram | null {
    if (shaderProgramCache[fragmentSource]) {
      currentProgram = shaderProgramCache[fragmentSource];
      gl.useProgram((currentProgram ? currentProgram.id : null) || null);
      return currentProgram as GLProgram;
    }
    currentProgram = new GLProgram(gl, shaders.vertexIdentity, fragmentSource);
    if (!currentProgram) {
      log('filter: could not get webgl program');
      return null;
    }
    const floatSize = Float32Array.BYTES_PER_ELEMENT;
    const vertSize = 4 * floatSize;
    gl.enableVertexAttribArray(currentProgram.attribute['pos']);
    gl.vertexAttribPointer(currentProgram.attribute['pos'], 2, gl.FLOAT, false, vertSize, 0 * floatSize);
    gl.enableVertexAttribArray(currentProgram.attribute['uv']);
    gl.vertexAttribPointer(currentProgram.attribute['uv'], 2, gl.FLOAT, false, vertSize, 2 * floatSize);
    shaderProgramCache[fragmentSource] = currentProgram;
    return currentProgram as GLProgram;
  }

  const filter = {
    colorMatrix: (matrix) => { // general color matrix filter
      const m = new Float32Array(matrix);
      m[4] /= 255;
      m[9] /= 255;
      m[14] /= 255;
      m[19] /= 255;
      const shader = (m[18] === 1 && m[3] === 0 && m[8] === 0 && m[13] === 0 && m[15] === 0 && m[16] === 0 && m[17] === 0 && m[19] === 0) // Can we ignore the alpha value? Makes things a bit faster.
        ? shaders.colorMatrixWithoutAlpha
        : shaders.colorMatrixWithAlpha;
      const program = compileShader(shader);
      if (!program) return;
      gl.uniform1fv(program.uniform['m'], m);
      draw();
    },

    brightness: (brightness) => {
      const b = (brightness || 0) + 1;
      filter.colorMatrix([
        b, 0, 0, 0, 0,
        0, b, 0, 0, 0,
        0, 0, b, 0, 0,
        0, 0, 0, 1, 0,
      ]);
    },

    saturation: (amount) => {
      const x = (amount || 0) * 2 / 3 + 1;
      const y = ((x - 1) * -0.5);
      filter.colorMatrix([
        x, y, y, 0, 0,
        y, x, y, 0, 0,
        y, y, x, 0, 0,
        0, 0, 0, 1, 0,
      ]);
    },

    desaturate: () => {
      filter.saturation(-1);
    },

    contrast: (amount) => {
      const v = (amount || 0) + 1;
      const o = -128 * (v - 1);
      filter.colorMatrix([
        v, 0, 0, 0, o,
        0, v, 0, 0, o,
        0, 0, v, 0, o,
        0, 0, 0, 1, 0,
      ]);
    },

    negative: () => {
      filter.contrast(-2);
    },

    hue: (rotation) => {
      rotation = (rotation || 0) / 180 * Math.PI;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const lumR = 0.213;
      const lumG = 0.715;
      const lumB = 0.072;
      filter.colorMatrix([
        lumR + cos * (1 - lumR) + sin * (-lumR), lumG + cos * (-lumG) + sin * (-lumG), lumB + cos * (-lumB) + sin * (1 - lumB), 0, 0,
        lumR + cos * (-lumR) + sin * (0.143), lumG + cos * (1 - lumG) + sin * (0.140), lumB + cos * (-lumB) + sin * (-0.283), 0, 0,
        lumR + cos * (-lumR) + sin * (-(1 - lumR)), lumG + cos * (-lumG) + sin * (lumG), lumB + cos * (1 - lumB) + sin * (lumB), 0, 0,
        0, 0, 0, 1, 0,
      ]);
    },

    desaturateLuminance: () => {
      filter.colorMatrix([
        0.2764723, 0.9297080, 0.0938197, 0, -37.1,
        0.2764723, 0.9297080, 0.0938197, 0, -37.1,
        0.2764723, 0.9297080, 0.0938197, 0, -37.1,
        0, 0, 0, 1, 0,
      ]);
    },

    sepia: () => {
      filter.colorMatrix([
        0.393, 0.7689999, 0.18899999, 0, 0,
        0.349, 0.6859999, 0.16799999, 0, 0,
        0.272, 0.5339999, 0.13099999, 0, 0,
        0, 0, 0, 1, 0,
      ]);
    },

    brownie: () => {
      filter.colorMatrix([
        0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 47.43192855600873,
        -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -36.96841498319127,
        0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283,
        0, 0, 0, 1, 0,
      ]);
    },

    vintagePinhole: () => {
      filter.colorMatrix([
        0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 9.651285835294123,
        0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 7.462829176470591,
        0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296,
        0, 0, 0, 1, 0,
      ]);
    },

    kodachrome: () => {
      filter.colorMatrix([
        1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502,
        -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203,
        -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946,
        0, 0, 0, 1, 0,
      ]);
    },

    technicolor: () => {
      filter.colorMatrix([
        1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337,
        -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398,
        -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138,
        0, 0, 0, 1, 0,
      ]);
    },

    polaroid: () => {
      filter.colorMatrix([
        1.438, -0.062, -0.062, 0, 0,
        -0.122, 1.378, -0.122, 0, 0,
        -0.016, -0.016, 1.483, 0, 0,
        0, 0, 0, 1, 0,
      ]);
    },

    shiftToBGR: () => {
      filter.colorMatrix([
        0, 0, 1, 0, 0,
        0, 1, 0, 0, 0,
        1, 0, 0, 0, 0,
        0, 0, 0, 1, 0,
      ]);
    },

    convolution: (matrix) => { // general convolution Filter
      const m = new Float32Array(matrix);
      const pixelSizeX = 1 / fxcanvas.width;
      const pixelSizeY = 1 / fxcanvas.height;
      const program = compileShader(shaders.convolution);
      if (!program) return;
      gl.uniform1fv(program.uniform['m'], m);
      gl.uniform2f(program.uniform['px'], pixelSizeX, pixelSizeY);
      draw();
    },

    detectEdges: () => {
      // @ts-ignore this
      filter.convolution.call(this, [
        0, 1, 0,
        1, -4, 1,
        0, 1, 0,
      ]);
    },

    sobelX: () => {
      // @ts-ignore this
      filter.convolution.call(this, [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1,
      ]);
    },

    sobelY: () => {
      // @ts-ignore this
      filter.convolution.call(this, [
        -1, -2, -1,
        0, 0, 0,
        1, 2, 1,
      ]);
    },

    sharpen: (amount) => {
      const a = amount || 1;
      // @ts-ignore this
      filter.convolution.call(this, [
        0, -1 * a, 0,
        -1 * a, 1 + 4 * a, -1 * a,
        0, -1 * a, 0,
      ]);
    },

    emboss: (size) => {
      const s = size || 1;
      // @ts-ignore this
      filter.convolution.call(this, [
        -2 * s, -1 * s, 0,
        -1 * s, 1, 1 * s,
        0, 1 * s, 2 * s,
      ]);
    },

    blur: (size) => {
      const blurSizeX = (size / 7) / fxcanvas.width;
      const blurSizeY = (size / 7) / fxcanvas.height;
      const program = compileShader(shaders.blur);
      if (!program) return;
      // Vertical
      gl.uniform2f(program.uniform['px'], 0, blurSizeY);
      draw(DRAW.INTERMEDIATE);
      // Horizontal
      gl.uniform2f(program.uniform['px'], blurSizeX, 0);
      draw();
    },

    pixelate: (size) => {
      const blurSizeX = (size) / fxcanvas.width;
      const blurSizeY = (size) / fxcanvas.height;
      const program = compileShader(shaders.pixelate);
      if (!program) return;
      gl.uniform2f(program.uniform['size'], blurSizeX, blurSizeY);
      draw();
    },
  };

  // @ts-ignore this
  this.add = function (name) {
    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.slice.call(arguments, 1);
    const func = filter[name];
    filterChain.push({ func, args });
  };

  // @ts-ignore this
  this.reset = function () {
    filterChain = [];
  };

  // @ts-ignore this
  this.get = function () {
    return filterChain;
  };

  // @ts-ignore this
  this.apply = function (image) {
    resize(image.width, image.height);
    drawCount = 0;
    if (!sourceTexture) sourceTexture = gl.createTexture(); // Create the texture for the input image if we haven't yet
    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    for (let i = 0; i < filterChain.length; i++) {
      lastInChain = (i === filterChain.length - 1);
      const f = filterChain[i];
      // @ts-ignore function assigment
      f.func.apply(this, f.args || []);
    }
    return fxcanvas;
  };

  // @ts-ignore this
  this.draw = function (image) {
    this.add('brightness', 0);
    return this.apply(image);
  };
}
