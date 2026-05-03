import type { XrayClient } from "../../../../../client/xray/xray-client";
import type { XrayTest } from "../../../../../types/xray/import-test-execution-results";
import type { MultipartInfo } from "../../../../../types/xray/requests/import-execution-multipart-info";
import type { Logger } from "../../../../../util/logging";
import type { Computable } from "../../../../command";
import { Command } from "../../../../command";
interface CommandParameters {
    testExecutionIssueKey?: string;
}
export declare class CombineCypressJsonCommand extends Command<Parameters<XrayClient["importExecutionMultipart"]>, CommandParameters> {
    private readonly cypressTestsJson;
    private readonly info;
    constructor(parameters: CommandParameters, logger: Logger, cypressTestsJson: Computable<[XrayTest, ...XrayTest[]]>, info: Computable<MultipartInfo>);
    protected computeResult(): Promise<Parameters<XrayClient["importExecutionMultipart"]>>;
}
export {};
