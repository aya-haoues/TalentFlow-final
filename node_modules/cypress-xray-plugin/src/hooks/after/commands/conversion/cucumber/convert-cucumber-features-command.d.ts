import type { InternalCucumberOptions, InternalJiraOptions, InternalXrayOptions } from "../../../../../types/plugin";
import type { CucumberMultipartFeature } from "../../../../../types/xray/requests/import-execution-cucumber-multipart";
import type { Logger } from "../../../../../util/logging";
import type { Computable } from "../../../../command";
import { Command } from "../../../../command";
interface Parameters {
    cucumber: Pick<InternalCucumberOptions, "prefixes">;
    jira: Pick<InternalJiraOptions, "projectKey">;
    projectRoot: string;
    useCloudTags?: boolean;
    xray: Pick<InternalXrayOptions, "status" | "testEnvironments" | "uploadScreenshots">;
}
export declare class ConvertCucumberFeaturesCommand extends Command<CucumberMultipartFeature[], Parameters> {
    private readonly cucumberResults;
    private readonly testExecutionIssueKey?;
    constructor(parameters: Parameters, logger: Logger, input: {
        cucumberResults: Computable<CucumberMultipartFeature[]>;
        testExecutionIssueKey?: Computable<string>;
    });
    protected computeResult(): Promise<CucumberMultipartFeature[]>;
    private getSteps;
    private assertScenarioContainsIssueKey;
}
export {};
