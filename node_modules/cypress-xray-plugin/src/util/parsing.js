"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asBoolean = asBoolean;
exports.asString = asString;
exports.asFloat = asFloat;
exports.asInt = asInt;
exports.asArrayOfStrings = asArrayOfStrings;
exports.asObject = asObject;
exports.parse = parse;
const dedent_1 = require("./dedent");
const string_1 = require("./string");
/**
 * Parses and returns a boolean value from a string.
 *
 * @param value - a string that can be interpreted as a boolean value
 * @returns the corresponding boolean value
 * @see https://www.npmjs.com/package/yn
 */
function asBoolean(value) {
    value = String(value).trim();
    if (/^(?:y|yes|true|1|on)$/i.test(value)) {
        return true;
    }
    if (/^(?:n|no|false|0|off)$/i.test(value)) {
        return false;
    }
    throw new Error(`Failed to parse boolean value from string: ${value}`);
}
/**
 * No-op function for consistency purposes.
 *
 * @param value - the string
 * @returns the string
 */
function asString(value) {
    return value;
}
/**
 * Parses and returns a float value from a string.
 *
 * @param value - a string that can be interpreted as a float value
 * @returns the corresponding float value
 */
function asFloat(value) {
    return Number.parseFloat(value);
}
/**
 * Parses and returns an integer value from a string.
 *
 * @param value - a string that can be interpreted as an integer value
 * @returns the corresponding integer value
 */
function asInt(value) {
    return Number.parseInt(value);
}
/**
 * Parses and returns an array of strings from an unknown value. If the value is not an array,
 * contains zero elements or non-primitive elements, corresponding errors will be thrown.
 *
 * @param value - a string that can be interpreted as a string array
 * @returns the corresponding string array
 */
function asArrayOfStrings(value) {
    if (!Array.isArray(value)) {
        throw new Error((0, dedent_1.dedent)(`
                Failed to parse as array of strings: ${JSON.stringify(value)}
                Expected an array of primitives, but got: ${(0, string_1.unknownToString)(value)}
            `));
    }
    const array = value.map((element, index) => {
        if (typeof element === "string" ||
            typeof element === "boolean" ||
            typeof element === "number" ||
            typeof element === "symbol" ||
            typeof element === "bigint") {
            return element.toString();
        }
        throw new Error((0, dedent_1.dedent)(`
                Failed to parse as array of strings: ${JSON.stringify(value)}
                Expected a primitive element at index ${index.toString()}, but got: ${JSON.stringify(element)}
            `));
    });
    if (array.length === 0) {
        throw new Error((0, dedent_1.dedent)(`
                Failed to parse as array of strings: ${JSON.stringify(value)}
                Expected an array of primitives with at least one element
            `));
    }
    return [array[0], ...array.slice(1)];
}
/**
 * Parses and returns an object from an unknown value. If the value is not an object, corresponding
 * errors will be thrown.
 *
 * @param value - a string that can be interpreted as an object
 * @returns the corresponding object
 */
function asObject(value) {
    if (Array.isArray(value)) {
        throw new Error(`Failed to parse as object: ${JSON.stringify(value)}`);
    }
    if (value === null) {
        throw new Error("Failed to parse as object: null");
    }
    if (value === undefined) {
        throw new Error("Failed to parse as object: undefined");
    }
    if (typeof value === "string" ||
        typeof value === "boolean" ||
        typeof value === "number" ||
        typeof value === "symbol" ||
        typeof value === "bigint") {
        throw new Error(`Failed to parse as object: ${value.toString()}`);
    }
    return value;
}
/**
 * Parses an environment variable to arbitrary data types.
 *
 * @param env - the object holding all environment variables as key-value pairs
 * @param variable - the variable name
 * @param parser - the parsing function
 * @returns the parsed data or undefined if the variable does not exist
 */
function parse(env, variable, parser) {
    if (variable in env) {
        return parser(env[variable]);
    }
    return undefined;
}
