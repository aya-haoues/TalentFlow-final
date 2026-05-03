"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertCypressConversionValidCommand = void 0;
const errors_1 = require("../../../../../util/errors");
const command_1 = require("../../../../command");
class AssertCypressConversionValidCommand extends command_1.Command {
    constructor(logger, xrayTestExecutionResults) {
        super(null, logger);
        this.xrayTestExecutionResults = xrayTestExecutionResults;
    }
    async computeResult() {
        const [results] = await this.xrayTestExecutionResults.compute();
        if (!results.tests || results.tests.length === 0) {
            throw new errors_1.SkippedError("Skipping Cypress results upload: No native Cypress tests were executed");
        }
    }
}
exports.AssertCypressConversionValidCommand = AssertCypressConversionValidCommand;
