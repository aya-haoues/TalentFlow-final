import type { XrayClient } from "../../../../client/xray/xray-client";
import type { ImportFeatureResponse } from "../../../../types/xray/responses/import-feature";
import { Command } from "../../../command";
interface Parameters {
    filePath: string;
    projectId?: string;
    projectKey?: string;
    source?: string;
    xrayClient: XrayClient;
}
export declare class ImportFeatureCommand extends Command<ImportFeatureResponse, Parameters> {
    protected computeResult(): Promise<ImportFeatureResponse>;
}
export {};
