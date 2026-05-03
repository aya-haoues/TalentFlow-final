"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchAllFieldsCommand = void 0;
const command_1 = require("../../../command");
class FetchAllFieldsCommand extends command_1.Command {
    async computeResult() {
        return await this.parameters.jiraClient.getFields();
    }
}
exports.FetchAllFieldsCommand = FetchAllFieldsCommand;
