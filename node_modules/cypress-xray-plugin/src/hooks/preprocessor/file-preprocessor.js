"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_command_1 = require("../util/commands/constant-command");
const edit_issue_field_command_1 = require("../util/commands/jira/edit-issue-field-command");
const get_label_values_command_1 = require("../util/commands/jira/get-label-values-command");
const get_summary_values_command_1 = require("../util/commands/jira/get-summary-values-command");
const import_feature_command_1 = require("../util/commands/xray/import-feature-command");
const extract_feature_file_issues_command_1 = require("./commands/extract-feature-file-issues-command");
const extract_issue_keys_command_1 = require("./commands/extract-issue-keys-command");
const get_labels_to_reset_command_1 = require("./commands/get-labels-to-reset-command");
const get_summaries_to_reset_command_1 = require("./commands/get-summaries-to-reset-command");
const get_updated_issues_command_1 = require("./commands/get-updated-issues-command");
const parse_feature_file_command_1 = require("./commands/parse-feature-file-command");
function addSynchronizationCommands(file, options, clients, graph, logger) {
    var _a;
    const parseFeatureFileCommand = graph.findOrDefault(parse_feature_file_command_1.ParseFeatureFileCommand, () => graph.place(new parse_feature_file_command_1.ParseFeatureFileCommand({ filePath: file.filePath }, logger)), (vertex) => {
        return vertex.getParameters().filePath === file.filePath;
    });
    const extractIssueDataCommand = graph.place(new extract_feature_file_issues_command_1.ExtractFeatureFileIssuesCommand({
        displayCloudHelp: clients.kind === "cloud",
        filePath: file.filePath,
        prefixes: (_a = options.cucumber) === null || _a === void 0 ? void 0 : _a.prefixes,
        projectKey: options.jira.projectKey,
    }, logger, parseFeatureFileCommand));
    graph.connect(parseFeatureFileCommand, extractIssueDataCommand);
    const extractIssueKeysCommand = graph.place(new extract_issue_keys_command_1.ExtractIssueKeysCommand(logger, extractIssueDataCommand));
    graph.connect(extractIssueDataCommand, extractIssueKeysCommand);
    // Xray currently (almost) always overwrites issue data when importing feature files to
    // existing issues. Therefore, we manually need to backup and reset the data once the
    // import is done.
    // See: https://docs.getxray.app/display/XRAY/Importing+Cucumber+Tests+-+REST
    // See: https://docs.getxray.app/display/XRAYCLOUD/Importing+Cucumber+Tests+-+REST+v2
    const getCurrentSummariesCommand = graph.place(new get_summary_values_command_1.GetSummaryValuesCommand({ jiraClient: clients.jiraClient }, logger, extractIssueKeysCommand));
    graph.connect(extractIssueKeysCommand, getCurrentSummariesCommand);
    const getCurrentLabelsCommand = graph.place(new get_label_values_command_1.GetLabelValuesCommand({ jiraClient: clients.jiraClient }, logger, extractIssueKeysCommand));
    graph.connect(extractIssueKeysCommand, getCurrentLabelsCommand);
    // Only import the feature once the backups have been created.
    const importFeatureCommand = graph.place(new import_feature_command_1.ImportFeatureCommand({
        filePath: file.filePath,
        projectKey: options.jira.projectKey,
        xrayClient: clients.xrayClient,
    }, logger));
    graph.connect(getCurrentSummariesCommand, importFeatureCommand);
    graph.connect(getCurrentLabelsCommand, importFeatureCommand);
    // Check which issues will need to have their backups restored.
    const getUpdatedIssuesCommand = graph.place(new get_updated_issues_command_1.GetUpdatedIssuesCommand({ filePath: file.filePath }, logger, extractIssueKeysCommand, importFeatureCommand));
    graph.connect(extractIssueKeysCommand, getUpdatedIssuesCommand);
    graph.connect(importFeatureCommand, getUpdatedIssuesCommand);
    const getNewSummariesCommand = graph.place(new get_summary_values_command_1.GetSummaryValuesCommand({ jiraClient: clients.jiraClient }, logger, extractIssueKeysCommand));
    graph.connect(extractIssueKeysCommand, getNewSummariesCommand);
    graph.connect(getUpdatedIssuesCommand, getNewSummariesCommand);
    const getNewLabelsCommand = graph.place(new get_label_values_command_1.GetLabelValuesCommand({ jiraClient: clients.jiraClient }, logger, extractIssueKeysCommand));
    graph.connect(extractIssueKeysCommand, getNewLabelsCommand);
    graph.connect(getUpdatedIssuesCommand, getNewLabelsCommand);
    const getSummariesToResetCommand = graph.place(new get_summaries_to_reset_command_1.GetSummariesToResetCommand(logger, getCurrentSummariesCommand, getNewSummariesCommand));
    graph.connect(getCurrentSummariesCommand, getSummariesToResetCommand);
    graph.connect(getNewSummariesCommand, getSummariesToResetCommand);
    const getLabelsToResetCommand = graph.place(new get_labels_to_reset_command_1.GetLabelsToResetCommand(logger, getCurrentLabelsCommand, getNewLabelsCommand));
    graph.connect(getCurrentLabelsCommand, getLabelsToResetCommand);
    graph.connect(getNewLabelsCommand, getLabelsToResetCommand);
    const editSummariesCommand = graph.place(new edit_issue_field_command_1.EditIssueFieldCommand({ fieldId: "summary", jiraClient: clients.jiraClient }, logger, new constant_command_1.ConstantCommand(logger, "summary"), getSummariesToResetCommand));
    graph.connect(getSummariesToResetCommand, editSummariesCommand);
    const editLabelsCommand = graph.place(new edit_issue_field_command_1.EditIssueFieldCommand({ fieldId: "labels", jiraClient: clients.jiraClient }, logger, new constant_command_1.ConstantCommand(logger, "labels"), getLabelsToResetCommand));
    graph.connect(getLabelsToResetCommand, editLabelsCommand);
}
/**
 * Workaround until module mocking becomes a stable feature. The current approach allows replacing
 * the function with a mocked one.
 *
 * @see https://nodejs.org/docs/latest-v23.x/api/test.html#mockmodulespecifier-options
 */
exports.default = { addSynchronizationCommands };
