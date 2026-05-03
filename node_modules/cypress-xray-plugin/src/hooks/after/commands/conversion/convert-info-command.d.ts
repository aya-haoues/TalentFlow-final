import type { IssueTypeDetails } from "../../../../types/jira/responses/issue-type-details";
import type { IssueUpdate } from "../../../../types/jira/responses/issue-update";
import type { InternalXrayOptions } from "../../../../types/plugin";
import type { MultipartInfo, MultipartInfoCloud } from "../../../../types/xray/requests/import-execution-multipart-info";
import type { Logger } from "../../../../util/logging";
import type { Computable } from "../../../command";
import { Command } from "../../../command";
import { type RunData, type TestExecutionIssueData, type TestExecutionIssueDataServer } from "./util/multipart-info";
interface Parameters {
    jira: {
        projectKey: string;
        testPlanIssueKey?: string;
    };
    xray: Pick<InternalXrayOptions, "testEnvironments" | "uploadScreenshots">;
}
declare abstract class ConvertInfoCommand<InfoType extends MultipartInfo> extends Command<InfoType, Parameters> {
    private readonly results;
    private readonly summary;
    private readonly issuetype;
    private readonly issueUpdate?;
    constructor(parameters: Parameters, logger: Logger, input: {
        issuetype: Computable<IssueTypeDetails>;
        issueUpdate?: Computable<IssueUpdate>;
        results: Computable<RunData>;
        summary: Computable<string>;
    });
    protected computeResult(): Promise<InfoType>;
    protected abstract buildInfo(runInformation: RunData, testExecutionIssueData: TestExecutionIssueData): InfoType | Promise<InfoType>;
}
export declare class ConvertInfoServerCommand extends ConvertInfoCommand<MultipartInfo> {
    private readonly testEnvironmentsId?;
    private readonly testPlanId?;
    constructor(parameters: Parameters, logger: Logger, input: {
        fieldIds?: {
            testEnvironmentsId?: Computable<string>;
            testPlanId?: Computable<string>;
        };
        issuetype: Computable<IssueTypeDetails>;
        issueUpdate?: Computable<IssueUpdate>;
        results: Computable<RunData>;
        summary: Computable<string>;
    });
    protected buildInfo(runInformation: RunData, testExecutionIssueData: TestExecutionIssueDataServer): Promise<MultipartInfo>;
}
export declare class ConvertInfoCloudCommand extends ConvertInfoCommand<MultipartInfoCloud> {
    protected buildInfo(runInformation: RunData, testExecutionIssueData: TestExecutionIssueData): Promise<MultipartInfo>;
}
export {};
