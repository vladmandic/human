/**
 * Module that analyzes existing results and recombines them into a unified person object
 */
import type { FaceResult, BodyResult, HandResult, GestureResult, PersonResult } from './result';
export declare function join(faces: Array<FaceResult>, bodies: Array<BodyResult>, hands: Array<HandResult>, gestures: Array<GestureResult>, shape: Array<number> | undefined): Array<PersonResult>;
//# sourceMappingURL=persons.d.ts.map