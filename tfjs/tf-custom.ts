/**
 * Creates tfjs bundle used by Human browser build target
 * @external
 */

import * as tf from '../../tfjs/dist/tfjs.esm';

// eslint-disable-next-line import/export
export * from '../../tfjs/dist/tfjs.esm';

// needs override
// eslint-disable-next-line import/export
export const version_core = tf.version['tfjs-core'];
