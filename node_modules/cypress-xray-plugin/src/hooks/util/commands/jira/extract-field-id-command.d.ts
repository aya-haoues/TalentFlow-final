import type { FieldDetail } from "../../../../types/jira/responses/field-detail";
import type { Logger } from "../../../../util/logging";
import type { Computable } from "../../../command";
import { Command } from "../../../command";
export declare enum JiraField {
    TEST_ENVIRONMENTS = "test environments",
    TEST_PLAN = "test plan"
}
interface Parameters {
    field: JiraField;
}
export declare class ExtractFieldIdCommand extends Command<string, Parameters> {
    private readonly allFields;
    constructor(parameters: Parameters, logger: Logger, allFields: Computable<FieldDetail[]>);
    protected computeResult(): Promise<string>;
}
export {};
