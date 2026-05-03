"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCypressStatus = toCypressStatus;
exports.getXrayStatus = getXrayStatus;
const status_1 = require("../../../../../../types/cypress/status");
/**
 * Converts the given status text string to a valid Cypress attempt status.
 *
 * @param statusText - the status text
 * @returns the Cypress attempt status
 * @throws if the status text cannot be mapped to a valid Cypress attempt status
 */
function toCypressStatus(statusText) {
    switch (statusText) {
        case "passed":
            return status_1.CypressStatus.PASSED;
        case "failed":
            return status_1.CypressStatus.FAILED;
        case "pending":
            return status_1.CypressStatus.PENDING;
        case "skipped":
            return status_1.CypressStatus.SKIPPED;
        default:
            throw new Error(`Unknown Cypress test status: ${statusText}`);
    }
}
/**
 * Converts the given Cypress status to an Xray status. If any of the following are `undefined`,
 * their respective Xray cloud or Xray server status values will be returned instead according to
 * `useCloudStatus`:
 *
 * - `statusOptions.passed`
 * - `statusOptions.failed`
 * - `statusOptions.pending`
 * - `statusOptions.skipped`
 *
 * @param state - the status text
 * @param useCloudStatus - whether to default to Xray cloud test statuses or Xray server ones
 * @param options - optional custom statuses
 * @returns the Xray status
 */
function getXrayStatus(status, useCloudStatus, statusOptions) {
    var _a, _b, _c, _d;
    switch (status) {
        case status_1.CypressStatus.PASSED:
            return (_a = statusOptions === null || statusOptions === void 0 ? void 0 : statusOptions.passed) !== null && _a !== void 0 ? _a : (useCloudStatus ? "PASSED" : "PASS");
        case status_1.CypressStatus.FAILED:
            return (_b = statusOptions === null || statusOptions === void 0 ? void 0 : statusOptions.failed) !== null && _b !== void 0 ? _b : (useCloudStatus ? "FAILED" : "FAIL");
        case status_1.CypressStatus.PENDING:
            return (_c = statusOptions === null || statusOptions === void 0 ? void 0 : statusOptions.pending) !== null && _c !== void 0 ? _c : (useCloudStatus ? "TO DO" : "TODO");
        case status_1.CypressStatus.SKIPPED:
            return (_d = statusOptions === null || statusOptions === void 0 ? void 0 : statusOptions.skipped) !== null && _d !== void 0 ? _d : (useCloudStatus ? "FAILED" : "FAIL");
    }
}
