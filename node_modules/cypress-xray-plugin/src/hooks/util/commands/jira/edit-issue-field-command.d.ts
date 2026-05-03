import type { JiraClient } from "../../../../client/jira/jira-client";
import type { StringMap } from "../../../../types/util";
import type { Logger } from "../../../../util/logging";
import type { Computable } from "../../../command";
import { Command } from "../../../command";
interface Parameters {
    fieldId: string;
    jiraClient: JiraClient;
}
export declare class EditIssueFieldCommand<FieldValue> extends Command<string[], Parameters> {
    private readonly fieldId;
    private readonly fieldValues;
    constructor(parameters: Parameters, logger: Logger, fieldId: Computable<string>, fieldValues: Computable<StringMap<FieldValue>>);
    protected computeResult(): Promise<string[]>;
}
export {};
