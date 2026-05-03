"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCall = getOrCall;
/**
 * If the value is a function, evaluates it and returns the result. Otherwise, the value will be
 * returned immediately.
 *
 * @param value - the value
 * @returns the value or the callback result
 */
async function getOrCall(value, ...args) {
    // See https://github.com/microsoft/TypeScript/issues/37663#issuecomment-1081610403
    if (isFunction(value)) {
        return await value(...args);
    }
    return value;
}
function isFunction(value) {
    return typeof value === "function";
}
