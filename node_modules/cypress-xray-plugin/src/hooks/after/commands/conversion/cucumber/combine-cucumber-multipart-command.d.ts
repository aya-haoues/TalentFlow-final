import type { CucumberMultipart, CucumberMultipartFeature } from "../../../../../types/xray/requests/import-execution-cucumber-multipart";
import type { MultipartInfo } from "../../../../../types/xray/requests/import-execution-multipart-info";
import type { Logger } from "../../../../../util/logging";
import type { Computable } from "../../../../command";
import { Command } from "../../../../command";
export declare class CombineCucumberMultipartCommand extends Command<CucumberMultipart, null> {
    private readonly cucumberMultipartInfo;
    private readonly cucumberMultipartFeatures;
    constructor(logger: Logger, cucumberMultipartInfo: Computable<MultipartInfo>, cucumberMultipartFeatures: Computable<CucumberMultipartFeature[]>);
    protected computeResult(): Promise<CucumberMultipart>;
}
