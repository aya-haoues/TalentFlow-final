import type { CucumberMultipart } from "../../../../../types/xray/requests/import-execution-cucumber-multipart";
import type { Logger } from "../../../../../util/logging";
import type { Computable } from "../../../../command";
import { Command } from "../../../../command";
export declare class AssertCucumberConversionValidCommand extends Command<void, null> {
    private readonly cucumberMultipart;
    constructor(logger: Logger, cucumberMultipart: Computable<CucumberMultipart>);
    protected computeResult(): Promise<void>;
}
