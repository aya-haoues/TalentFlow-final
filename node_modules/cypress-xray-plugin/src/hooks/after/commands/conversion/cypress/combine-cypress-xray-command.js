"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombineCypressJsonCommand = void 0;
const command_1 = require("../../../../command");
class CombineCypressJsonCommand extends command_1.Command {
    constructor(parameters, logger, cypressTestsJson, info) {
        super(parameters, logger);
        this.cypressTestsJson = cypressTestsJson;
        this.info = info;
    }
    async computeResult() {
        const results = await this.cypressTestsJson.compute();
        const info = await this.info.compute();
        return [
            {
                testExecutionKey: this.parameters.testExecutionIssueKey,
                tests: results,
            },
            info,
        ];
    }
}
exports.CombineCypressJsonCommand = CombineCypressJsonCommand;
