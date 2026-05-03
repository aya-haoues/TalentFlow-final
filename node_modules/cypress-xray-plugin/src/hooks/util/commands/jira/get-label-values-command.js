"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLabelValuesCommand = void 0;
const extraction_1 = require("../../../../util/extraction");
const constant_command_1 = require("../constant-command");
const get_field_values_command_1 = require("./get-field-values-command");
class GetLabelValuesCommand extends get_field_values_command_1.GetFieldValuesCommand {
    constructor(parameters, logger, issueKeys) {
        super(parameters, logger, new constant_command_1.ConstantCommand(logger, "labels"), issueKeys);
    }
    async computeResult() {
        // Field property example:
        // labels: ["regression", "quality"]
        return await this.extractJiraFieldValues((issue) => (0, extraction_1.extractArrayOfStrings)(issue.fields, "labels"));
    }
}
exports.GetLabelValuesCommand = GetLabelValuesCommand;
