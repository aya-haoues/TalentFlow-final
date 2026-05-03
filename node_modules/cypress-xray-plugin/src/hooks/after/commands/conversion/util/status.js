"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXrayStatus = getXrayStatus;
/**
 * Converts the given Cucumber status to an Xray status. Returns the original status if no matching
 * custom status is specified.
 *
 * @param state - the status text
 * @param options - optional custom statuses
 * @returns the Xray status
 */
function getXrayStatus(status, statusOptions) {
    var _a, _b, _c, _d;
    // Cast for code completion purposes.
    switch (status) {
        case "failed":
            return (_a = statusOptions === null || statusOptions === void 0 ? void 0 : statusOptions.failed) !== null && _a !== void 0 ? _a : "failed";
        case "passed":
            return (_b = statusOptions === null || statusOptions === void 0 ? void 0 : statusOptions.passed) !== null && _b !== void 0 ? _b : "passed";
        case "pending":
            return (_c = statusOptions === null || statusOptions === void 0 ? void 0 : statusOptions.pending) !== null && _c !== void 0 ? _c : "pending";
        case "skipped":
            return (_d = statusOptions === null || statusOptions === void 0 ? void 0 : statusOptions.skipped) !== null && _d !== void 0 ? _d : "skipped";
        case "undefined":
            return "undefined";
        case "unknown":
            return "unknown";
        default:
            throw new Error(`Unknown status: ${status}`);
    }
}
