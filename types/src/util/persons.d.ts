/**
 * Analyze detection Results and sort&combine them into per-person view
 */
import type { FaceResult, BodyResult, HandResult, GestureResult, PersonResult } from '../result';
export declare function join(faces: Array<FaceResult>, bodies: Array<BodyResult>, hands: Array<HandResult>, gestures: Array<GestureResult>, shape: Array<number> | undefined): Array<PersonResult>;
//# sourceMappingURL=persons.d.ts.map