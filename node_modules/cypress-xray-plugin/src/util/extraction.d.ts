/**
 * Extracts a string property from an object.
 *
 * @param data - the object
 * @param propertyName - the property to access
 * @returns the property's string value
 * @throws if `data` is not an object or does not contain a string property `propertyName`
 */
export declare function extractString(data: unknown, propertyName: string): string;
/**
 * Extracts a string array property from an object.
 *
 * @param data - the object
 * @param propertyName - the property to access
 * @returns the property's string array value
 * @throws if `data` is not an object or does not contain a string array property `propertyName`
 */
export declare function extractArrayOfStrings(data: unknown, propertyName: string): string[];
/**
 * Recursively extracts a string property from an object. The array of property names is used to
 * recursively access the nested property values of the provided data object. The last nested
 * object must then contain a string property matching the last provided property name.
 *
 * @example
 * ```ts
 * const data = {
 *   a: {
 *     b: {
 *       c: {
 *         d: "hello"
 *       }
 *     }
 *   }
 * };
 * console.log(extractNestedString(data, ["a", "b", "c", "d"]));
 * // hello
 * ```
 *
 * @param data - the object
 * @param propertyNames - the properties to access
 * @returns the property's string value
 * @throws if `data` is not an object or does not contain a nested string property `propertyName`
 */
export declare function extractNestedString(data: unknown, propertyNames: [string, ...string[]]): string;
