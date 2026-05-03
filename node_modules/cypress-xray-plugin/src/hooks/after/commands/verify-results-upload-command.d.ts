import type { Logger } from "../../../util/logging";
import type { Computable } from "../../command";
import { Command } from "../../command";
interface Parameters {
    url: string;
}
export declare class VerifyResultsUploadCommand extends Command<string, Parameters> {
    private readonly resolvedCypressExecutionIssueKey?;
    private readonly resolvedCucumberExecutionIssueKey?;
    constructor(parameters: Parameters, logger: Logger, inputs?: {
        cucumberExecutionIssueKey?: Computable<string | undefined>;
        cypressExecutionIssueKey?: Computable<string | undefined>;
    });
    protected computeResult(): Promise<string>;
}
export {};
