import type { GherkinDocument } from "@cucumber/messages";
import type { FeatureFileIssueData } from "../../../types/cucumber/cucumber";
import type { CucumberOptions } from "../../../types/plugin";
import type { Logger } from "../../../util/logging";
import type { Computable } from "../../command";
import { Command } from "../../command";
interface Parameters {
    displayCloudHelp: boolean;
    filePath: string;
    prefixes: Readonly<CucumberOptions["prefixes"]>;
    projectKey: string;
}
export declare class ExtractFeatureFileIssuesCommand extends Command<FeatureFileIssueData, Parameters> {
    private readonly document;
    constructor(parameters: Parameters, logger: Logger, document: Computable<GherkinDocument>);
    protected computeResult(): Promise<FeatureFileIssueData>;
}
export {};
