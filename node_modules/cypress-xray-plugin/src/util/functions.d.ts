import type { MaybeFunction } from "../types/util";
/**
 * If the value is a function, evaluates it and returns the result. Otherwise, the value will be
 * returned immediately.
 *
 * @param value - the value
 * @returns the value or the callback result
 */
export declare function getOrCall<P extends unknown[], T>(value: MaybeFunction<P, T>, ...args: P): Promise<T>;
