"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateConstantCommand = getOrCreateConstantCommand;
exports.getOrCreateExtractFieldIdCommand = getOrCreateExtractFieldIdCommand;
const constant_command_1 = require("./commands/constant-command");
const extract_field_id_command_1 = require("./commands/jira/extract-field-id-command");
const fetch_all_fields_command_1 = require("./commands/jira/fetch-all-fields-command");
function getOrCreateConstantCommand(graph, logger, value) {
    for (const command of graph.getVertices()) {
        if (command instanceof constant_command_1.ConstantCommand) {
            if (command.getValue() === value && command.getLogger() === logger) {
                // Cast valid because of value equality.
                return command;
            }
        }
    }
    return graph.place(new constant_command_1.ConstantCommand(logger, value));
}
function getOrCreateExtractFieldIdCommand(field, jiraClient, graph, logger) {
    const fetchAllFieldsCommand = graph.findOrDefault(fetch_all_fields_command_1.FetchAllFieldsCommand, () => graph.place(new fetch_all_fields_command_1.FetchAllFieldsCommand({ jiraClient: jiraClient }, logger)));
    const extractFieldIdCommand = graph.findOrDefault(extract_field_id_command_1.ExtractFieldIdCommand, () => {
        const command = graph.place(new extract_field_id_command_1.ExtractFieldIdCommand({ field: field }, logger, fetchAllFieldsCommand));
        graph.connect(fetchAllFieldsCommand, command);
        return command;
    }, (command) => {
        return command.getParameters().field === field;
    });
    return extractFieldIdCommand;
}
