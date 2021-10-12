export const vertexIdentity = `
  precision highp float;
  attribute vec2 pos;
  attribute vec2 uv;
  varying vec2 vUv;
  uniform float flipY;
  void main(void) {
    vUv = uv;
    gl_Position = vec4(pos.x, pos.y*flipY, 0.0, 1.);
  }
`;

export const fragmentIdentity = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D texture;
  void main(void) {
    gl_FragColor = texture2D(texture, vUv);
  }
`;

export const colorMatrixWithAlpha = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D texture;
  uniform float m[20];
  void main(void) {
    vec4 c = texture2D(texture, vUv);
    gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[3] * c.a + m[4];
    gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[8] * c.a + m[9];
    gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[13] * c.a + m[14];
    gl_FragColor.a = m[15] * c.r + m[16] * c.g + m[17] * c.b + m[18] * c.a + m[19];
  }
`;

export const colorMatrixWithoutAlpha = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D texture;
  uniform float m[20];
  void main(void) {
    vec4 c = texture2D(texture, vUv);
    gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[4];
    gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[9];
    gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[14];
    gl_FragColor.a = c.a;
  }
`;

export const pixelate = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 size;
  uniform sampler2D texture;
  vec2 pixelate(vec2 coord, vec2 size) {
    return floor( coord / size ) * size;
  }
  void main(void) {
    gl_FragColor = vec4(0.0);
    vec2 coord = pixelate(vUv, size);
    gl_FragColor += texture2D(texture, coord);
  }
`;

export const blur = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D texture;
  uniform vec2 px;
  void main(void) {
    gl_FragColor = vec4(0.0);
    gl_FragColor += texture2D(texture, vUv + vec2(-7.0*px.x, -7.0*px.y))*0.0044299121055113265;
    gl_FragColor += texture2D(texture, vUv + vec2(-6.0*px.x, -6.0*px.y))*0.00895781211794;
    gl_FragColor += texture2D(texture, vUv + vec2(-5.0*px.x, -5.0*px.y))*0.0215963866053;
    gl_FragColor += texture2D(texture, vUv + vec2(-4.0*px.x, -4.0*px.y))*0.0443683338718;
    gl_FragColor += texture2D(texture, vUv + vec2(-3.0*px.x, -3.0*px.y))*0.0776744219933;
    gl_FragColor += texture2D(texture, vUv + vec2(-2.0*px.x, -2.0*px.y))*0.115876621105;
    gl_FragColor += texture2D(texture, vUv + vec2(-1.0*px.x, -1.0*px.y))*0.147308056121;
    gl_FragColor += texture2D(texture, vUv                             )*0.159576912161;
    gl_FragColor += texture2D(texture, vUv + vec2( 1.0*px.x,  1.0*px.y))*0.147308056121;
    gl_FragColor += texture2D(texture, vUv + vec2( 2.0*px.x,  2.0*px.y))*0.115876621105;
    gl_FragColor += texture2D(texture, vUv + vec2( 3.0*px.x,  3.0*px.y))*0.0776744219933;
    gl_FragColor += texture2D(texture, vUv + vec2( 4.0*px.x,  4.0*px.y))*0.0443683338718;
    gl_FragColor += texture2D(texture, vUv + vec2( 5.0*px.x,  5.0*px.y))*0.0215963866053;
    gl_FragColor += texture2D(texture, vUv + vec2( 6.0*px.x,  6.0*px.y))*0.00895781211794;
    gl_FragColor += texture2D(texture, vUv + vec2( 7.0*px.x,  7.0*px.y))*0.0044299121055113265;
  }
`;

export const convolution = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D texture;
  uniform vec2 px;
  uniform float m[9];
  void main(void) {
    vec4 c11 = texture2D(texture, vUv - px); // top left
    vec4 c12 = texture2D(texture, vec2(vUv.x, vUv.y - px.y)); // top center
    vec4 c13 = texture2D(texture, vec2(vUv.x + px.x, vUv.y - px.y)); // top right
    vec4 c21 = texture2D(texture, vec2(vUv.x - px.x, vUv.y) ); // mid left
    vec4 c22 = texture2D(texture, vUv); // mid center
    vec4 c23 = texture2D(texture, vec2(vUv.x + px.x, vUv.y) ); // mid right
    vec4 c31 = texture2D(texture, vec2(vUv.x - px.x, vUv.y + px.y) ); // bottom left
    vec4 c32 = texture2D(texture, vec2(vUv.x, vUv.y + px.y) ); // bottom center
    vec4 c33 = texture2D(texture, vUv + px ); // bottom right
    gl_FragColor = 
    c11 * m[0] + c12 * m[1] + c22 * m[2] +
    c21 * m[3] + c22 * m[4] + c23 * m[5] +
    c31 * m[6] + c32 * m[7] + c33 * m[8];
    gl_FragColor.a = c22.a;
  }
`;
