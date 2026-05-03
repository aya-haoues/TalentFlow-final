"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizedFilename = normalizedFilename;
/**
 * Normalizes a filename by replacing invalid character sequences with `_`.
 *
 * @param filename - any filename
 * @returns the normalized filename
 */
function normalizedFilename(filename) {
    return filename.replaceAll(/[^.a-zA-Z0-9]+/g, "_").substring(0, 200);
}
