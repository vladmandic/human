import type { Config } from './config';
import type { Result } from './result';
/** Warmup method pre-initializes all configured models for faster inference
 * - can take significant time on startup
 * - only used for `webgl` and `humangl` backends
 * @param userConfig?: Config
*/
export declare function warmup(instance: any, userConfig?: Partial<Config>): Promise<Result | {
    error: any;
}>;
//# sourceMappingURL=warmup.d.ts.map