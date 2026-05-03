import type { JiraClient } from "../../../../client/jira/jira-client";
import type { IssueTransition } from "../../../../types/jira/responses/issue-transition";
import type { Logger } from "../../../../util/logging";
import type { Computable } from "../../../command";
import { Command } from "../../../command";
interface Parameters {
    jiraClient: JiraClient;
    transition: IssueTransition;
}
export declare class TransitionIssueCommand extends Command<void, Parameters> {
    private readonly resolvedExecutionIssueKey;
    constructor(parameters: Parameters, logger: Logger, resolvedExecutionIssueKey: Computable<string>);
    protected computeResult(): Promise<void>;
}
export {};
