"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSummaryValuesCommand = void 0;
const extraction_1 = require("../../../../util/extraction");
const constant_command_1 = require("../constant-command");
const get_field_values_command_1 = require("./get-field-values-command");
class GetSummaryValuesCommand extends get_field_values_command_1.GetFieldValuesCommand {
    constructor(parameters, logger, issueKeys) {
        super(parameters, logger, new constant_command_1.ConstantCommand(logger, "summary"), issueKeys);
    }
    async computeResult() {
        // Field property example:
        // summary: "Bug 12345"
        return await super.extractJiraFieldValues((issue) => (0, extraction_1.extractString)(issue.fields, "summary"));
    }
}
exports.GetSummaryValuesCommand = GetSummaryValuesCommand;
