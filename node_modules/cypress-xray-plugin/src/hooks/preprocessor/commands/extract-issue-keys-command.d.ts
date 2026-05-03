import type { FeatureFileIssueData } from "../../../types/cucumber/cucumber";
import type { Logger } from "../../../util/logging";
import type { Computable } from "../../command";
import { Command } from "../../command";
export declare class ExtractIssueKeysCommand extends Command<string[], null> {
    private readonly issueData;
    constructor(logger: Logger, issueData: Computable<FeatureFileIssueData>);
    protected computeResult(): Promise<string[]>;
}
