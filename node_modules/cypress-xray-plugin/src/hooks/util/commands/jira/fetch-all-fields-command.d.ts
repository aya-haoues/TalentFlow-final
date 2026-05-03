import type { JiraClient } from "../../../../client/jira/jira-client";
import type { FieldDetail } from "../../../../types/jira/responses/field-detail";
import { Command } from "../../../command";
interface Parameters {
    jiraClient: JiraClient;
}
export declare class FetchAllFieldsCommand extends Command<FieldDetail[], Parameters> {
    protected computeResult(): Promise<FieldDetail[]>;
}
export {};
