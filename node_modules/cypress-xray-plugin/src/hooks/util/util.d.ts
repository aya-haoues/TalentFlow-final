import type { JiraClient } from "../../client/jira/jira-client";
import type { ExecutableGraph } from "../../util/graph/executable-graph";
import type { Logger } from "../../util/logging";
import type { Command } from "../command";
import { ConstantCommand } from "./commands/constant-command";
import type { JiraField } from "./commands/jira/extract-field-id-command";
export declare function getOrCreateConstantCommand<T>(graph: ExecutableGraph<Command>, logger: Logger, value: T): ConstantCommand<T>;
export declare function getOrCreateExtractFieldIdCommand(field: JiraField, jiraClient: JiraClient, graph: ExecutableGraph<Command>, logger: Logger): Command<string>;
