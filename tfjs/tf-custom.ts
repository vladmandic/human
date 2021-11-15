/** Creates tfjs bundle used by Human browser build target
 * @external
 */
// import * as tf from '../../tfjs';
import * as tf from '@vladmandic/tfjs';

// export * from '../../tfjs';
export * from '@vladmandic/tfjs';

/** Define custom TFJS version */
export const version_core = tf.version['tfjs-core'];
