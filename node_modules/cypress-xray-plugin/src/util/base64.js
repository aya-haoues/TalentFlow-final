"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeFile = encodeFile;
exports.encode = encode;
const fs_1 = require("fs");
/**
 * Encodes and returns some file's content in base64.
 * @param file - path to the file to encode
 * @returns the base64 string
 */
function encodeFile(file) {
    return (0, fs_1.readFileSync)(file, { encoding: "base64" });
}
/**
 * Encodes and returns some string in base64.
 * @param value - the string to encode
 * @returns the base64 encoded value
 */
function encode(value) {
    return Buffer.from(value).toString("base64");
}
