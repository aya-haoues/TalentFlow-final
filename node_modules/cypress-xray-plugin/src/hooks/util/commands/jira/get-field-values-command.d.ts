import type { JiraClient } from "../../../../client/jira/jira-client";
import type { Issue } from "../../../../types/jira/responses/issue";
import type { StringMap } from "../../../../types/util";
import type { Logger } from "../../../../util/logging";
import type { Computable } from "../../../command";
import { Command } from "../../../command";
interface Parameters {
    jiraClient: JiraClient;
}
export declare abstract class GetFieldValuesCommand<FieldValue> extends Command<StringMap<FieldValue>, Parameters> {
    protected readonly fieldId: Computable<string>;
    protected readonly issueKeys: Computable<string[]>;
    constructor(parameters: Parameters, logger: Logger, fieldId: Computable<string>, issueKeys: Computable<string[]>);
    protected extractJiraFieldValues(extractor: (issue: Issue, fieldId: string) => FieldValue | Promise<FieldValue>): Promise<StringMap<FieldValue>>;
}
export {};
