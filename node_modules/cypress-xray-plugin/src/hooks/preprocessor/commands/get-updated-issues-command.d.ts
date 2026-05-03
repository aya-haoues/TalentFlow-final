import type { ImportFeatureResponse } from "../../../types/xray/responses/import-feature";
import type { Logger } from "../../../util/logging";
import type { Computable } from "../../command";
import { Command } from "../../command";
interface Parameters {
    filePath: string;
}
export declare class GetUpdatedIssuesCommand extends Command<string[], Parameters> {
    private readonly expectedAffectedIssues;
    private readonly importResponse;
    constructor(parameters: Parameters, logger: Logger, expectedAffectedIssues: Computable<string[]>, importResponse: Computable<ImportFeatureResponse>);
    protected computeResult(): Promise<string[]>;
}
export {};
