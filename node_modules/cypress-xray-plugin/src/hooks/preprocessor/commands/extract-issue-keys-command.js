"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractIssueKeysCommand = void 0;
const command_1 = require("../../command");
class ExtractIssueKeysCommand extends command_1.Command {
    constructor(logger, issueData) {
        super(null, logger);
        this.issueData = issueData;
    }
    async computeResult() {
        const issueData = await this.issueData.compute();
        return [
            ...issueData.tests.map((data) => data.key),
            ...issueData.preconditions.map((data) => data.key),
        ];
    }
}
exports.ExtractIssueKeysCommand = ExtractIssueKeysCommand;
