/** TFJS backend initialization and customization */
import type { Human } from '../human';
export declare function check(instance: Human, force?: boolean): Promise<boolean>;
export declare function fakeOps(kernelNames: Array<string>, config: any): void;
