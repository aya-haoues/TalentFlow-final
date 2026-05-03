import type { JiraClient } from "../../../../client/jira/jira-client";
import type { Attachment } from "../../../../types/jira/responses/attachment";
import type { Logger } from "../../../../util/logging";
import type { Computable } from "../../../command";
import { Command } from "../../../command";
interface Parameters {
    jiraClient: JiraClient;
}
export declare class AttachFilesCommand extends Command<Attachment[], Parameters> {
    private readonly files;
    private readonly resolvedExecutionIssueKey;
    constructor(parameters: Parameters, logger: Logger, files: Computable<string[]>, resolvedExecutionIssueKey: Computable<string>);
    protected computeResult(): Promise<Attachment[]>;
}
export {};
