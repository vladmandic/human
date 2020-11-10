// custom: bundle 3.4M
/*
import * as tf from '../../../dev-clone/tfjs/tfjs/dist/tf.esnext.js';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm/dist/index.js';

const loadGraphModel = tf.loadGraphModel;
export { tf, setWasmPaths, loadGraphModel };
*/

// monolithic: bundle 3.4M
import * as tf from '@tensorflow/tfjs/dist/tf.es2017.js';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm/dist/index.js';

const loadGraphModel = tf.loadGraphModel;
export { tf, setWasmPaths, loadGraphModel };

// modular: bundle 4.2M
/*
import * as tf from '@tensorflow/tfjs-core/dist/tf-core.es2017.js';
import { loadGraphModel } from '@tensorflow/tfjs-converter/dist/tf-converter.es2017.js';
import * as tfCPU from '@tensorflow/tfjs-backend-cpu/dist/tf-backend-cpu.es2017.js';
import * as tfWebGL from '@tensorflow/tfjs-backend-webgl/dist/tf-backend-webgl.es2017.js';
import { setWasmPaths, version_wasm } from '@tensorflow/tfjs-backend-wasm/dist/index.js';

const version = { core: tf.version, cpu: tfCPU.version_cpu, webgl: tfWebGL.version_webgl, wasm: version_wasm };

export { tf, setWasmPaths, loadGraphModel, version };
*/
