/** Face descriptor type as number array */
export declare type Descriptor = Array<number>;
export declare type Options = {
    order?: number;
    threshold?: number;
    multiplier?: number;
} | undefined;
/** Calculates distance between two descriptors
 * @param {object} options
 * @param {number} options.order algorithm to use
 * - Euclidean distance if `order` is 2 (default), Minkowski distance algorithm of nth order if `order` is higher than 2
 * @param {number} options.multiplier by how much to enhance difference analysis in range of 1..100
 * - default is 20 which normalizes results to similarity above 0.5 can be considered a match
 * @returns {number}
 */
export declare function distance(descriptor1: Descriptor, descriptor2: Descriptor, options?: Options): number;
/** Calculates normalized similarity between two face descriptors based on their `distance`
 * @param {object} options
 * @param {number} options.order algorithm to use
 * - Euclidean distance if `order` is 2 (default), Minkowski distance algorithm of nth order if `order` is higher than 2
 * @param {number} options.multiplier by how much to enhance difference analysis in range of 1..100
 * - default is 20 which normalizes results to similarity above 0.5 can be considered a match
 * @returns {number} similarity between two face descriptors normalized to 0..1 range where 0 is no similarity and 1 is perfect similarity
 */
export declare function similarity(descriptor1: Descriptor, descriptor2: Descriptor, options?: Options): number;
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
export declare function match(descriptor: Descriptor, descriptors: Array<Descriptor>, options?: Options): {
    index: number;
    distance: number;
    similarity: number;
};
