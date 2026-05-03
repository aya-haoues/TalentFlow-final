"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CypressStatus = void 0;
/**
 * All test statuses Cypress assigns to test attempts.
 */
var CypressStatus;
(function (CypressStatus) {
    /**
     * A test marked as failed.
     *
     * @see https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Failed
     */
    CypressStatus["FAILED"] = "failed";
    /**
     * A test marked as passed.
     *
     * @see https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Passed
     */
    CypressStatus["PASSED"] = "passed";
    /**
     * A test marked as pending.
     *
     * @see https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Pending
     */
    CypressStatus["PENDING"] = "pending";
    /**
     * A test marked as skipped.
     *
     * @see https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Skipped
     */
    CypressStatus["SKIPPED"] = "skipped";
})(CypressStatus || (exports.CypressStatus = CypressStatus = {}));
