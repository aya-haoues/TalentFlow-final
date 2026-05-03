import type { XrayClient } from "../../../../../client/xray/xray-client";
import type { Logger } from "../../../../../util/logging";
import type { Computable } from "../../../../command";
import { Command } from "../../../../command";
export declare class AssertCypressConversionValidCommand extends Command<void, null> {
    private readonly xrayTestExecutionResults;
    constructor(logger: Logger, xrayTestExecutionResults: Computable<Parameters<XrayClient["importExecutionMultipart"]>>);
    protected computeResult(): Promise<void>;
}
