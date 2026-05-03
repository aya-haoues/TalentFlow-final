"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractString = extractString;
exports.extractArrayOfStrings = extractArrayOfStrings;
exports.extractNestedString = extractNestedString;
const string_1 = require("./string");
/**
 * Extracts a string property from an object.
 *
 * @param data - the object
 * @param propertyName - the property to access
 * @returns the property's string value
 * @throws if `data` is not an object or does not contain a string property `propertyName`
 */
function extractString(data, propertyName) {
    verifyIsObjectWithProperty(data, propertyName);
    const value = data[propertyName];
    if (typeof value !== "string") {
        throw new Error(`Value is not of type string: ${(0, string_1.unknownToString)(value)}`);
    }
    return value;
}
/**
 * Extracts a string array property from an object.
 *
 * @param data - the object
 * @param propertyName - the property to access
 * @returns the property's string array value
 * @throws if `data` is not an object or does not contain a string array property `propertyName`
 */
function extractArrayOfStrings(data, propertyName) {
    verifyIsObjectWithProperty(data, propertyName);
    const value = data[propertyName];
    if (!Array.isArray(value) || value.some((element) => typeof element !== "string")) {
        throw new Error(`Value is not an array of type string: ${JSON.stringify(value)}`);
    }
    return value;
}
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
function extractNestedString(data, propertyNames) {
    let currentData = data;
    for (let i = 0; i < propertyNames.length - 1; i++) {
        const property = propertyNames[i];
        verifyIsObjectWithProperty(currentData, property);
        currentData = currentData[property];
    }
    return extractString(currentData, propertyNames[propertyNames.length - 1]);
}
function verifyIsObjectWithProperty(data, propertyName) {
    if (typeof data !== "object" || data === null || !(propertyName in data)) {
        throw new Error(`Expected an object containing property '${propertyName}', but got: ${JSON.stringify(data)}`);
    }
}
