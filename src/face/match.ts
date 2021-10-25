/** Face descriptor type as number array */
export type Descriptor = Array<number>

/** Calculates distance between two descriptors
 * @param {object} options
 * @param {number} options.order algorithm to use
 * - Euclidean distance if `order` is 2 (default), Minkowski distance algorithm of nth order if `order` is higher than 2
 * @param {number} options.multiplier by how much to enhance difference analysis in range of 1..100
 * - default is 20 which normalizes results to similarity above 0.5 can be considered a match
 * @returns {number}
 */
export function distance(descriptor1: Descriptor, descriptor2: Descriptor, options = { order: 2, multiplier: 20 }) {
  // general minkowski distance, euclidean distance is limited case where order is 2
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = (options.order === 2) ? (descriptor1[i] - descriptor2[i]) : (Math.abs(descriptor1[i] - descriptor2[i]));
    sum += (options.order === 2) ? (diff * diff) : (diff ** options.order);
  }
  return (options.multiplier || 20) * sum;
}

/** Calculates normalized similarity between two face descriptors based on their `distance`
 * @param {object} options
 * @param {number} options.order algorithm to use
 * - Euclidean distance if `order` is 2 (default), Minkowski distance algorithm of nth order if `order` is higher than 2
 * @param {number} options.multiplier by how much to enhance difference analysis in range of 1..100
 * - default is 20 which normalizes results to similarity above 0.5 can be considered a match
 * @returns {number} similarity between two face descriptors normalized to 0..1 range where 0 is no similarity and 1 is perfect similarity
 */
export function similarity(descriptor1: Descriptor, descriptor2: Descriptor, options = { order: 2, multiplier: 20 }) {
  const dist = distance(descriptor1, descriptor2, options);
  const root = (options.order === 2) ? Math.sqrt(dist) : dist ** (1 / options.order);
  const invert = Math.max(0, 100 - root) / 100.0;
  return invert;
}

/** Matches given descriptor to a closest entry in array of descriptors
 * @param descriptor face descriptor
 * @param descriptors array of face descriptors to commpare given descriptor to
 * @param {object} options
 * @param {number} options.order see {@link similarity}
 * @param {number} options.multiplier see {@link similarity}
 * @returns {object}
 * - `index` index array index where best match was found or -1 if no matches
 * - {@link distance} calculated `distance` of given descriptor to the best match
 * - {@link similarity} calculated normalized `similarity` of given descriptor to the best match
*/
export function match(descriptor: Descriptor, descriptors: Array<Descriptor>, options = { order: 2, threshold: 0, multiplier: 20 }) {
  if (!Array.isArray(descriptor) || !Array.isArray(descriptors) || descriptor.length < 64 || descriptors.length === 0 || descriptor.length !== descriptors[0].length) { // validate input
    return { index: -1, distance: Number.POSITIVE_INFINITY, similarity: 0 };
  }
  let best = Number.MAX_SAFE_INTEGER;
  let index = -1;
  for (let i = 0; i < descriptors.length; i++) {
    const res = distance(descriptor, descriptors[i], options);
    if (res < best) {
      best = res;
      index = i;
    }
    if (best < options.threshold) break;
  }
  best = (options.order === 2) ? Math.sqrt(best) : best ** (1 / options.order);
  return { index, distance: best, similarity: Math.max(0, 100 - best) / 100.0 };
}
