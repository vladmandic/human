/** Load method preloads all instance.configured models on-demand
 * - Not explicitly required as any required model is load implicitly on it's first run
 * @param userinstance.config?: {@link instance.config}
*/
export declare function load(instance: any): Promise<void>;
