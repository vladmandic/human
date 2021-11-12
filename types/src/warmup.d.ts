/**
 * Warmup algorithm that uses embedded images to excercise loaded models for faster future inference
 */
import type { Config } from './config';
import type { Result } from './result';
import type { Human } from './human';
/** Warmup method pre-initializes all configured models for faster inference
 * - can take significant time on startup
 * - only used for `webgl` and `humangl` backends
 * @param userConfig?: Config
*/
export declare function warmup(instance: Human, userConfig?: Partial<Config>): Promise<Result | {
    error: any;
}>;
