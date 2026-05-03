"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertCucumberConversionValidCommand = void 0;
const errors_1 = require("../../../../../util/errors");
const command_1 = require("../../../../command");
class AssertCucumberConversionValidCommand extends command_1.Command {
    constructor(logger, cucumberMultipart) {
        super(null, logger);
        this.cucumberMultipart = cucumberMultipart;
    }
    async computeResult() {
        const cucumberMultipart = await this.cucumberMultipart.compute();
        if (cucumberMultipart.features.length === 0) {
            throw new errors_1.SkippedError("Skipping Cucumber results upload: No Cucumber tests were executed");
        }
    }
}
exports.AssertCucumberConversionValidCommand = AssertCucumberConversionValidCommand;
