"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertInfoCloudCommand = exports.ConvertInfoServerCommand = void 0;
const functions_1 = require("../../../../util/functions");
const command_1 = require("../../../command");
const multipart_info_1 = require("./util/multipart-info");
class ConvertInfoCommand extends command_1.Command {
    constructor(parameters, logger, input) {
        super(parameters, logger);
        this.results = input.results;
        this.issueUpdate = input.issueUpdate;
        this.summary = input.summary;
        this.issuetype = input.issuetype;
    }
    async computeResult() {
        var _a;
        const runInformation = await this.results.compute();
        const issueUpdate = await ((_a = this.issueUpdate) === null || _a === void 0 ? void 0 : _a.compute());
        const testExecutionIssueData = {
            projectKey: this.parameters.jira.projectKey,
            testExecutionIssue: {
                fields: {
                    ...issueUpdate === null || issueUpdate === void 0 ? void 0 : issueUpdate.fields,
                    issuetype: await this.issuetype.compute(),
                    summary: await this.summary.compute(),
                },
                historyMetadata: issueUpdate === null || issueUpdate === void 0 ? void 0 : issueUpdate.historyMetadata,
                properties: issueUpdate === null || issueUpdate === void 0 ? void 0 : issueUpdate.properties,
                transition: issueUpdate === null || issueUpdate === void 0 ? void 0 : issueUpdate.transition,
                update: issueUpdate === null || issueUpdate === void 0 ? void 0 : issueUpdate.update,
            },
        };
        return await this.buildInfo(runInformation, testExecutionIssueData);
    }
}
class ConvertInfoServerCommand extends ConvertInfoCommand {
    constructor(parameters, logger, input) {
        var _a, _b, _c, _d;
        super(parameters, logger, input);
        if (this.parameters.jira.testPlanIssueKey && !((_a = input.fieldIds) === null || _a === void 0 ? void 0 : _a.testPlanId)) {
            throw new Error("A test plan issue key was supplied without the test plan Jira field ID");
        }
        if (this.parameters.xray.testEnvironments && !((_b = input.fieldIds) === null || _b === void 0 ? void 0 : _b.testEnvironmentsId)) {
            throw new Error("Test environments were supplied without the test environments Jira field ID");
        }
        this.testEnvironmentsId = (_c = input.fieldIds) === null || _c === void 0 ? void 0 : _c.testEnvironmentsId;
        this.testPlanId = (_d = input.fieldIds) === null || _d === void 0 ? void 0 : _d.testPlanId;
    }
    async buildInfo(runInformation, testExecutionIssueData) {
        if (this.parameters.jira.testPlanIssueKey && this.testPlanId) {
            const testPlandId = await this.testPlanId.compute();
            testExecutionIssueData.testPlan = {
                fieldId: testPlandId,
                value: await (0, functions_1.getOrCall)(this.parameters.jira.testPlanIssueKey),
            };
        }
        if (this.parameters.xray.testEnvironments && this.testEnvironmentsId) {
            const testEnvironmentsId = await this.testEnvironmentsId.compute();
            testExecutionIssueData.testEnvironments = {
                fieldId: testEnvironmentsId,
                value: this.parameters.xray.testEnvironments,
            };
        }
        return (0, multipart_info_1.buildMultipartInfoServer)(runInformation, testExecutionIssueData);
    }
}
exports.ConvertInfoServerCommand = ConvertInfoServerCommand;
class ConvertInfoCloudCommand extends ConvertInfoCommand {
    async buildInfo(runInformation, testExecutionIssueData) {
        if (this.parameters.jira.testPlanIssueKey) {
            testExecutionIssueData.testPlan = {
                value: await (0, functions_1.getOrCall)(this.parameters.jira.testPlanIssueKey),
            };
        }
        if (this.parameters.xray.testEnvironments) {
            testExecutionIssueData.testEnvironments = {
                value: this.parameters.xray.testEnvironments,
            };
        }
        return (0, multipart_info_1.buildMultipartInfoCloud)(runInformation, testExecutionIssueData);
    }
}
exports.ConvertInfoCloudCommand = ConvertInfoCloudCommand;
