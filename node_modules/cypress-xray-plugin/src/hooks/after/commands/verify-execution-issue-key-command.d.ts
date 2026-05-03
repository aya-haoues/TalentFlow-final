import type { IssueTypeDetails } from "../../../types/jira/responses/issue-type-details";
import type { Logger } from "../../../util/logging";
import type { Computable } from "../../command";
import { Command } from "../../command";
interface Parameters {
    displayCloudHelp: boolean;
    importType: "cucumber" | "cypress";
    testExecutionIssueKey?: string;
    testExecutionIssueType: IssueTypeDetails;
}
export declare class VerifyExecutionIssueKeyCommand extends Command<string, Parameters> {
    private readonly resolvedExecutionIssue;
    constructor(parameters: Parameters, logger: Logger, resolvedExecutionIssue: Computable<string>);
    protected computeResult(): Promise<string>;
}
export {};
