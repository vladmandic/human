/**
 * CenterNet object detection module
 */
import { Item } from '../result';
export declare function load(config: any): Promise<any>;
export declare function predict(input: any, config: any): Promise<Item[]>;
