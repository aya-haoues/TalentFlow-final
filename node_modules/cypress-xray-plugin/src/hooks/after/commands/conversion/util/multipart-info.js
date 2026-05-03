"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMultipartInfoServer = buildMultipartInfoServer;
exports.buildMultipartInfoCloud = buildMultipartInfoCloud;
const dedent_1 = require("../../../../../util/dedent");
/**
 * Converts Cypress run data into Cucumber multipart information, which could be used when creating
 * new test executions on import or when updating existing ones.
 *
 * @param runData - Cypress run data
 * @param testExecutionIssueData - additional information to consider
 * @returns the Cucumber multipart information data for Xray server
 */
function buildMultipartInfoServer(runData, testExecutionIssueData) {
    const multipartInfo = getBaseInfo(runData, testExecutionIssueData);
    if (testExecutionIssueData.testPlan) {
        multipartInfo.fields[testExecutionIssueData.testPlan.fieldId] = [
            testExecutionIssueData.testPlan.value,
        ];
    }
    if (testExecutionIssueData.testEnvironments) {
        multipartInfo.fields[testExecutionIssueData.testEnvironments.fieldId] =
            testExecutionIssueData.testEnvironments.value;
    }
    multipartInfo.fields = {
        ...multipartInfo.fields,
        ...testExecutionIssueData.testExecutionIssue.fields,
    };
    return multipartInfo;
}
/**
 * Converts Cypress run data into Cucumber multipart information, which could be used when creating
 * new test executions on import or when updating existing ones.
 *
 * @param runData - Cypress run data
 * @param testExecutionIssueData - additional information to consider
 * @returns the Cucumber multipart information data for Xray cloud
 */
function buildMultipartInfoCloud(runData, testExecutionIssueData) {
    var _a, _b;
    const multipartInfo = {
        ...getBaseInfo(runData, testExecutionIssueData),
        xrayFields: {
            environments: (_a = testExecutionIssueData.testEnvironments) === null || _a === void 0 ? void 0 : _a.value,
            testPlanKey: (_b = testExecutionIssueData.testPlan) === null || _b === void 0 ? void 0 : _b.value,
        },
    };
    multipartInfo.fields = {
        ...multipartInfo.fields,
        ...testExecutionIssueData.testExecutionIssue.fields,
    };
    return multipartInfo;
}
function getBaseInfo(runData, testExecutionIssueData) {
    var _a, _b, _c, _d;
    return {
        fields: {
            description: (_b = (_a = testExecutionIssueData.testExecutionIssue.fields) === null || _a === void 0 ? void 0 : _a.description) !== null && _b !== void 0 ? _b : (0, dedent_1.dedent)(`
                    Cypress version: ${runData.cypressVersion}
                    Browser: ${runData.browserName} (${runData.browserVersion})
                `),
            issuetype: (_c = testExecutionIssueData.testExecutionIssue.fields) === null || _c === void 0 ? void 0 : _c.issuetype,
            project: {
                key: testExecutionIssueData.projectKey,
            },
            summary: (_d = testExecutionIssueData.testExecutionIssue.fields) === null || _d === void 0 ? void 0 : _d.summary,
        },
        historyMetadata: testExecutionIssueData.testExecutionIssue.historyMetadata,
        properties: testExecutionIssueData.testExecutionIssue.properties,
        transition: testExecutionIssueData.testExecutionIssue.transition,
        update: testExecutionIssueData.testExecutionIssue.update,
    };
}
