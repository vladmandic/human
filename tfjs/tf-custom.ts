/** Creates tfjs bundle used by Human browser build target
 * @external
 */
import * as tf from '../../tfjs';

// eslint-disable-next-line import/export
export * from '../../tfjs';

/** Define custom TFJS version */
// eslint-disable-next-line import/export
export const version_core = tf.version['tfjs-core'];
