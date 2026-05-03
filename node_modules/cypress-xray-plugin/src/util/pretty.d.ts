import type { StringMap } from "../types/util";
/**
 * Converts the values of all given objects into strings and pads them such that values belonging to
 * the same property are strings of equal length. For stringification,
 * {@link JSON.stringify | `JSON.stringify`} is used.
 *
 * @example
 * ```ts
 * const a = {
 *   x: "hello",
 *   y: "bonjour"
 * };
 * const b = {
 *   x: "goodbye",
 *   b: 123456789
 * };
 * console.log(JSON.stringify(prettyPadObjects([a, b])));
 * // [
 * //   '{"x":"hello  ","y":"bonjour"}'
 * //   '{"x":"goodbye","b":"123456789"}'
 * // ]
 * ```
 *
 * @param objects - the objects to pretty pad
 * @returns the pretty padded objects
 */
export declare function prettyPadObjects(objects: object[]): StringMap<string>[];
/**
 * Pads the values of an object such that all values are mapped to strings of equal length. For
 * stringification, {@link JSON.stringify | `JSON.stringify`} is used.
 *
 * @example
 * ```ts
 * const a = {
 *   x: "hello",
 *   y: "bonjour"
 *   z: 123
 * };
 * console.log(JSON.stringify(prettyPadValues(a));
 * // '{"x":"hello  ","y":"bonjour","z":"123    "}'
 * ```
 *
 * @param value - the object
 * @returns the pretty padded object
 */
export declare function prettyPadValues(value: object): StringMap<string>;
