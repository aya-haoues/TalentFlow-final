"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unknownToString = unknownToString;
const ansi_colors_1 = __importDefault(require("ansi-colors"));
/**
 * Converts an unknown value to a string.
 *
 * @param value - the value
 * @param pretty - `true` to pretty print the string (if possible), `false` otherwse
 * @returns the string
 */
function unknownToString(value, pretty) {
    switch (typeof value) {
        case "string":
            return value;
        case "number":
        case "boolean":
        case "symbol":
        case "function":
            return value.toString();
        case "undefined":
            return "undefined";
        case "object":
            if (pretty) {
                return JSON.stringify(value, null, 2);
            }
            return JSON.stringify(value);
        default:
            throw new Error(`Unknown value type: ${ansi_colors_1.default.red(String(value))}`);
    }
}
