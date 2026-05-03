"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractFieldIdCommand = exports.JiraField = void 0;
const dedent_1 = require("../../../../util/dedent");
const pretty_1 = require("../../../../util/pretty");
const command_1 = require("../../../command");
var JiraField;
(function (JiraField) {
    JiraField["TEST_ENVIRONMENTS"] = "test environments";
    JiraField["TEST_PLAN"] = "test plan";
})(JiraField || (exports.JiraField = JiraField = {}));
class ExtractFieldIdCommand extends command_1.Command {
    constructor(parameters, logger, allFields) {
        super(parameters, logger);
        this.allFields = allFields;
    }
    async computeResult() {
        const jiraFields = await this.allFields.compute();
        // Lowercase everything to work around case sensitivities.
        // Jira sometimes returns field names capitalized, sometimes it doesn't (?).
        const lowerCasedName = this.parameters.field.toLowerCase();
        const matches = jiraFields.filter((field) => {
            return field.name.toLowerCase() === lowerCasedName;
        });
        if (matches.length > 1) {
            const nameDuplicates = (0, pretty_1.prettyPadObjects)(matches)
                .map((duplicate) => Object.entries(duplicate)
                .map((entry) => `${entry[0]}: ${entry[1]}`)
                .join(", "))
                .sort()
                .join("\n");
            const idSuggestions = matches.map((field) => `"${field.id}"`).join(" or ");
            throw new Error((0, dedent_1.dedent)(`
                    Failed to fetch Jira field ID for field with name: ${this.parameters.field}
                    There are multiple fields with this name

                    Duplicates:
                      ${nameDuplicates}

                    You can provide field IDs in the options:

                      jira: {
                        fields: {
                          ${getOptionName(this.parameters.field)}: // ${idSuggestions}
                        }
                      }
                `));
        }
        if (matches.length === 0) {
            const fieldNames = {};
            jiraFields.forEach((field) => {
                fieldNames[field.id] = field.name;
            });
            if (Object.keys(fieldNames).length === 0) {
                throw new Error((0, dedent_1.dedent)(`
                        Failed to fetch Jira field ID for field with name: ${this.parameters.field}
                        Make sure the field actually exists and that your Jira language settings did not modify the field's name

                        You can provide field IDs directly without relying on language settings:

                          jira: {
                            fields: {
                              ${getOptionName(this.parameters.field)}: // corresponding field ID
                            }
                          }
                    `));
            }
            else {
                const availableFields = Object.entries((0, pretty_1.prettyPadValues)(fieldNames))
                    .map((entry) => `name: ${entry[1]} id: ${JSON.stringify(entry[0])}`)
                    .sort();
                throw new Error((0, dedent_1.dedent)(`
                        Failed to fetch Jira field ID for field with name: ${this.parameters.field}
                        Make sure the field actually exists and that your Jira language settings did not modify the field's name

                        Available fields:
                          ${availableFields.join("\n")}

                        You can provide field IDs directly without relying on language settings:

                          jira: {
                            fields: {
                              ${getOptionName(this.parameters.field)}: // corresponding field ID
                            }
                          }
                    `));
            }
        }
        return matches[0].id;
    }
}
exports.ExtractFieldIdCommand = ExtractFieldIdCommand;
function getOptionName(fieldName) {
    switch (fieldName) {
        case JiraField.TEST_ENVIRONMENTS:
            return "testEnvironments";
        case JiraField.TEST_PLAN:
            return "testPlan";
    }
}
