/** Defines Descriptor type */
export declare type Descriptor = Array<number>;
/** Calculates distance between two descriptors
 *  - Minkowski distance algorithm of nth order if `order` is different than 2
 *  - Euclidean distance if `order` is 2 (default)
 *
 * Options:
 * - `order`
 *
 * Note: No checks are performed for performance reasons so make sure to pass valid number arrays of equal length
 */
export declare function distance(descriptor1: Descriptor, descriptor2: Descriptor, options?: {
    order: number;
}): number;
/** Calculates normalized similarity between two descriptors based on their `distance`
 */
export declare function similarity(descriptor1: Descriptor, descriptor2: Descriptor, options?: {
    order: number;
}): number;
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
export declare function match(descriptor: Descriptor, descriptors: Array<Descriptor>, options?: {
    order: number;
    threshold: number;
}): {
    index: number;
    distance: number;
    similarity: number;
};
//# sourceMappingURL=match.d.ts.map