import type { StringMap } from "../../../types/util";
import type { Logger } from "../../../util/logging";
import type { Computable } from "../../command";
import { Command } from "../../command";
export declare class GetSummariesToResetCommand extends Command<StringMap<string>, null> {
    private readonly oldValues;
    private readonly newValues;
    constructor(logger: Logger, oldValues: Computable<StringMap<string>>, newValues: Computable<StringMap<string>>);
    protected computeResult(): Promise<StringMap<string>>;
}
