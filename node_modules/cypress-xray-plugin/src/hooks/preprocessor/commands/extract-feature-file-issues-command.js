"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractFeatureFileIssuesCommand = void 0;
const dedent_1 = require("../../../util/dedent");
const errors_1 = require("../../../util/errors");
const help_1 = require("../../../util/help");
const command_1 = require("../../command");
const precondition_1 = require("./parsing/precondition");
const scenario_1 = require("./parsing/scenario");
class ExtractFeatureFileIssuesCommand extends command_1.Command {
    constructor(parameters, logger, document) {
        super(parameters, logger);
        this.document = document;
    }
    async computeResult() {
        var _a, _b, _c;
        const parsedDocument = await this.document.compute();
        const featureFileIssueKeys = {
            preconditions: [],
            tests: [],
        };
        const backgrounds = [];
        const scenarios = [];
        if ((_a = parsedDocument.feature) === null || _a === void 0 ? void 0 : _a.children) {
            for (const child of parsedDocument.feature.children) {
                if (child.scenario) {
                    scenarios.push(child.scenario);
                }
                if (child.background) {
                    backgrounds.push(child.background);
                }
                if (child.rule) {
                    for (const ruleChild of child.rule.children) {
                        if (ruleChild.scenario) {
                            scenarios.push(ruleChild.scenario);
                        }
                        if (ruleChild.background) {
                            backgrounds.push(ruleChild.background);
                        }
                    }
                }
            }
        }
        for (const background of backgrounds) {
            const preconditionComments = (0, precondition_1.getCucumberPreconditionIssueComments)(background, parsedDocument.comments);
            const preconditionKeys = (0, precondition_1.getCucumberPreconditionIssueTags)(background, this.parameters.projectKey, preconditionComments, (_b = this.parameters.prefixes) === null || _b === void 0 ? void 0 : _b.precondition);
            if (preconditionKeys.length === 0) {
                const firstStepLine = background.steps.length > 0
                    ? `${background.steps[0].keyword.trim()} ${background.steps[0].text}`
                    : "Given A step";
                if (preconditionComments.length > 0) {
                    throw new Error((0, dedent_1.dedent)(`
                            ${this.parameters.filePath}

                              Background: ${background.name.length > 0 ? background.name : "<no name>"}

                                No precondition issue keys found in comments:

                                  ${preconditionComments.join("\n")}

                                If a comment contains the precondition issue key already, specify a global prefix to align the plugin with Xray.

                                  For example, with the following plugin configuration:

                                    {
                                      cucumber: {
                                        prefixes: {
                                          precondition: "Precondition:"
                                        }
                                      }
                                    }

                                  The following comment will be recognized as a precondition issue tag by the plugin:

                                    ${background.keyword}: ${background.name}
                                      #@Precondition:${this.parameters.projectKey}-123
                                      ${firstStepLine}
                                      ...

                                For more information, visit:
                                - ${help_1.HELP.plugin.guides.targetingExistingIssues}
                                - ${help_1.HELP.plugin.configuration.cucumber.prefixes}
                                - ${this.parameters.displayCloudHelp
                        ? help_1.HELP.xray.importCucumberTests.cloud
                        : help_1.HELP.xray.importCucumberTests.server}
                        `));
                }
                throw new Error((0, dedent_1.dedent)(`
                        ${this.parameters.filePath}

                          Background: ${background.name.length > 0 ? background.name : "<no name>"}

                            No precondition issue keys found in comments.

                            You can target existing precondition issues by adding a corresponding comment:

                              ${background.keyword}: ${background.name}
                                #@${this.parameters.projectKey}-123
                                ${firstStepLine}
                                ...

                            You can also specify a prefix to match the tagging scheme configured in your Xray instance:

                              Plugin configuration:

                                {
                                  cucumber: {
                                    prefixes: {
                                      precondition: "Precondition:"
                                    }
                                  }
                                }

                              Feature file:

                                ${background.keyword}: ${background.name}
                                  #@Precondition:${this.parameters.projectKey}-123
                                  ${firstStepLine}
                                  ...

                            For more information, visit:
                            - ${help_1.HELP.plugin.guides.targetingExistingIssues}
                            - ${help_1.HELP.plugin.configuration.cucumber.prefixes}
                            - ${this.parameters.displayCloudHelp
                    ? help_1.HELP.xray.importCucumberTests.cloud
                    : help_1.HELP.xray.importCucumberTests.server}
                    `));
            }
            else if (preconditionKeys.length > 1) {
                throw new Error((0, dedent_1.dedent)(`
                        ${this.parameters.filePath}

                          Background: ${background.name.length > 0 ? background.name : "<no name>"}

                            Multiple precondition issue keys found in the background's comments. Xray will only take one into account, you have to decide which one to use:

                              ${reconstructMultipleTagsBackground(background, preconditionKeys, parsedDocument.comments)}

                            For more information, visit:
                            - ${this.parameters.displayCloudHelp
                    ? help_1.HELP.xray.importCucumberTests.cloud
                    : help_1.HELP.xray.importCucumberTests.server}
                            - ${help_1.HELP.plugin.guides.targetingExistingIssues}
                    `));
            }
            featureFileIssueKeys.preconditions.push({
                key: preconditionKeys[0],
                summary: background.name,
            });
        }
        for (const scenario of scenarios) {
            const issueKeys = (0, scenario_1.getCucumberScenarioIssueTags)(scenario, this.parameters.projectKey, (_c = this.parameters.prefixes) === null || _c === void 0 ? void 0 : _c.test);
            if (issueKeys.length === 0) {
                throw new Error((0, dedent_1.dedent)(`
                        ${this.parameters.filePath}

                          ${(0, errors_1.errorMessage)((0, errors_1.missingTestKeyInCucumberScenarioError)(scenario, this.parameters.projectKey, this.parameters.displayCloudHelp))}
                    `));
            }
            else if (issueKeys.length > 1) {
                throw new Error((0, dedent_1.dedent)(`
                        ${this.parameters.filePath}

                          ${(0, errors_1.errorMessage)(multipleTestKeysInCucumberScenarioError(scenario, scenario.tags, issueKeys, this.parameters.displayCloudHelp))}
                    `));
            }
            featureFileIssueKeys.tests.push({
                key: issueKeys[0],
                summary: scenario.name,
                tags: scenario.tags.map((tag) => tag.name.replace("@", "")),
            });
        }
        return featureFileIssueKeys;
    }
}
exports.ExtractFeatureFileIssuesCommand = ExtractFeatureFileIssuesCommand;
function reconstructMultipleTagsBackground(background, preconditionIssueKeys, comments) {
    const example = [];
    const backgroundLine = background.location.line;
    const firstStepLine = background.steps[0].location.line;
    example.push(`${background.keyword}: ${background.name}`);
    for (const comment of comments) {
        if (comment.location.line > backgroundLine && comment.location.line < firstStepLine) {
            example.push(`  ${comment.text.trimStart()}`);
            if (preconditionIssueKeys.some((key) => comment.text.endsWith(key))) {
                example.push(`  ${comment.text.replaceAll(/\S/g, "^").trimStart()}`);
            }
        }
    }
    example.push(`  ${background.steps[0].keyword.trim()} ${background.steps[0].text}`);
    example.push("  ...");
    return example.join("\n");
}
function multipleTestKeysInCucumberScenarioError(scenario, tags, issueKeys, isCloudClient) {
    const firstStepLine = scenario.steps.length > 0
        ? `${scenario.steps[0].keyword.trim()} ${scenario.steps[0].text}`
        : "Given A step";
    return new Error((0, dedent_1.dedent)(`
            Scenario: ${scenario.name.length > 0 ? scenario.name : "<no name>"}

              Multiple test issue keys found in the scenario's tags. Xray will only take one into account, you have to decide which one to use:

                ${tags.map((tag) => tag.name).join(" ")}
                ${tags
        .map((tag) => {
        if (issueKeys.some((key) => tag.name.endsWith(key))) {
            return "^".repeat(tag.name.length);
        }
        return " ".repeat(tag.name.length);
    })
        .join(" ")
        .trimEnd()}
                ${scenario.keyword}: ${scenario.name}
                  ${firstStepLine}
                  ...

              For more information, visit:
              - ${isCloudClient
        ? help_1.HELP.xray.importCucumberTests.cloud
        : help_1.HELP.xray.importCucumberTests.server}
              - ${help_1.HELP.plugin.guides.targetingExistingIssues}
        `));
}
