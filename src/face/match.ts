/** Defines Descriptor type */
export type Descriptor = Array<number>

/** Calculates distance between two descriptors
 *  - Minkowski distance algorithm of nth order if `order` is different than 2
 *  - Euclidean distance if `order` is 2 (default)
 *
 * Options:
 * - `order`
 *
 * Note: No checks are performed for performance reasons so make sure to pass valid number arrays of equal length
 */
export function distance(descriptor1: Descriptor, descriptor2: Descriptor, options = { order: 2 }) {
  // general minkowski distance, euclidean distance is limited case where order is 2
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = (options.order === 2) ? (descriptor1[i] - descriptor2[i]) : (Math.abs(descriptor1[i] - descriptor2[i]));
    sum += (options.order === 2) ? (diff * diff) : (diff ** options.order);
  }
  return sum;
}

/** Calculates normalized similarity between two descriptors based on their `distance`
 */
export function similarity(descriptor1: Descriptor, descriptor2: Descriptor, options = { order: 2 }) {
  const dist = distance(descriptor1, descriptor2, options);
  const invert = (options.order === 2) ? Math.sqrt(dist) : dist ** (1 / options.order);
  return Math.max(0, 100 - invert) / 100.0;
}

/** Matches given descriptor to a closest entry in array of descriptors
 * @param descriptor face descriptor
 * @param descriptors array of face descriptors to commpare given descriptor to
 *
 * Options:
 * - `order` see {@link distance} method
 * - `threshold` match will return result first result for which {@link distance} is below `threshold` even if there may be better results
 *
 * @returns object with index, distance and similarity
 * - `index` index array index where best match was found or -1 if no matches
 * - {@link distance} calculated `distance` of given descriptor to the best match
 * - {@link similarity} calculated normalized `similarity` of given descriptor to the best match
*/
export function match(descriptor: Descriptor, descriptors: Array<Descriptor>, options = { order: 2, threshold: 0 }) {
  if (!Array.isArray(descriptor) || !Array.isArray(descriptors) || descriptor.length < 64 || descriptors.length === 0 || descriptor.length !== descriptors[0].length) { // validate input
    return { index: -1, distance: Number.POSITIVE_INFINITY, similarity: 0 };
  }
  let best = Number.MAX_SAFE_INTEGER;
  let index = -1;
  for (let i = 0; i < descriptors.length; i++) {
    const res = distance(descriptor, descriptors[i], { order: options.order });
    if (res < best) {
      best = res;
      index = i;
    }
    if (best < options.threshold) break;
  }
  best = (options.order === 2) ? Math.sqrt(best) : best ** (1 / options.order);
  return { index, distance: best, similarity: Math.max(0, 100 - best) / 100.0 };
}
