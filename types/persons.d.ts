/**
 * Module that analyzes existing results and recombines them into a unified person object
 */
import { Face, Body, Hand, Gesture, Person } from './result';
export declare function join(faces: Array<Face>, bodies: Array<Body>, hands: Array<Hand>, gestures: Array<Gesture>, shape: Array<number> | undefined): Array<Person>;
