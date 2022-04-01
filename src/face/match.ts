/** Face descriptor type as number array */
export type Descriptor = Array<number>
export type MatchOptions = { order?: number, threshold?: number, multiplier?: number, min?: number, max?: number } | undefined;

/** Calculates distance between two descriptors
 * @param options - calculation options
 * - order - algorithm to use
 *   Euclidean distance if `order` is 2 (default), Minkowski distance algorithm of nth order if `order` is higher than 2
 * - multiplier - by how much to enhance difference analysis in range of 1..100
 *   default is 20 which normalizes results to similarity above 0.5 can be considered a match
 */
export function distance(descriptor1: Descriptor, descriptor2: Descriptor, options: MatchOptions = { order: 2, multiplier: 25 }) {
  // general minkowski distance, euclidean distance is limited case where order is 2
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = (!options.order || options.order === 2) ? (descriptor1[i] - descriptor2[i]) : (Math.abs(descriptor1[i] - descriptor2[i]));
    sum += (!options.order || options.order === 2) ? (diff * diff) : (diff ** options.order);
  }
  return (options.multiplier || 20) * sum;
}

// invert distance to similarity, normalize to given range and clamp
const normalizeDistance = (dist, order, min, max) => {
  if (dist === 0) return 1; // short circuit for identical inputs
  const root = order === 2 ? Math.sqrt(dist) : dist ** (1 / order); // take root of distance
  const norm = (1 - (root / 100) - min) / (max - min); // normalize to range
  const clamp = Math.max(Math.min(norm, 1), 0); // clamp to 0..1
  return clamp;
};

/** Calculates normalized similarity between two face descriptors based on their `distance`
 * @param options - calculation options
 * - order - algorithm to use
 *   Euclidean distance if `order` is 2 (default), Minkowski distance algorithm of nth order if `order` is higher than 2
 * - multiplier - by how much to enhance difference analysis in range of 1..100
 *   default is 20 which normalizes results to similarity above 0.5 can be considered a match
 * - min - normalize similarity result to a given range
 * - max - normalzie similarity resutl to a given range
 *   default is 0.2...0.8
 * Returns similarity between two face descriptors normalized to 0..1 range where 0 is no similarity and 1 is perfect similarity
 */
export function similarity(descriptor1: Descriptor, descriptor2: Descriptor, options: MatchOptions = { order: 2, multiplier: 25, min: 0.2, max: 0.8 }) {
  const dist = distance(descriptor1, descriptor2, options);
  return normalizeDistance(dist, options.order || 2, options.min || 0, options.max || 1);
}

/** Matches given descriptor to a closest entry in array of descriptors
 * @param descriptor - face descriptor
 * @param descriptors - array of face descriptors to commpare given descriptor to
 * @param options - see `similarity` method for options description
 * Returns
 * - `index` index array index where best match was found or -1 if no matches
 * - `distance` calculated `distance` of given descriptor to the best match
 * - `similarity` calculated normalized `similarity` of given descriptor to the best match
*/
export function match(descriptor: Descriptor, descriptors: Array<Descriptor>, options: MatchOptions = { order: 2, multiplier: 25, threshold: 0, min: 0.2, max: 0.8 }) {
  if (!Array.isArray(descriptor) || !Array.isArray(descriptors) || descriptor.length < 64 || descriptors.length === 0 || descriptor.length !== descriptors[0].length) { // validate input
    return { index: -1, distance: Number.POSITIVE_INFINITY, similarity: 0 };
  }
  let lowestDistance = Number.MAX_SAFE_INTEGER;
  let index = -1;
  for (let i = 0; i < descriptors.length; i++) {
    const res = distance(descriptor, descriptors[i], options);
    if (res < lowestDistance) {
      lowestDistance = res;
      index = i;
    }
    if (lowestDistance < (options.threshold || 0)) break;
  }
  const normalizedSimilarity = normalizeDistance(lowestDistance, options.order || 2, options.min || 0, options.max || 1);
  return { index, distance: lowestDistance, similarity: normalizedSimilarity };
}
