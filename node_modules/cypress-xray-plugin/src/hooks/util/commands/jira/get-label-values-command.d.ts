import type { JiraClient } from "../../../../client/jira/jira-client";
import type { StringMap } from "../../../../types/util";
import type { Logger } from "../../../../util/logging";
import type { Computable } from "../../../command";
import { GetFieldValuesCommand } from "./get-field-values-command";
export declare class GetLabelValuesCommand extends GetFieldValuesCommand<string[]> {
    constructor(parameters: {
        jiraClient: JiraClient;
    }, logger: Logger, issueKeys: Computable<string[]>);
    protected computeResult(): Promise<StringMap<string[]>>;
}
