import type { Logger } from "../../../util/logging";
import { Command } from "../../command";
export declare class ConstantCommand<R> extends Command<R, null> {
    private readonly value;
    constructor(logger: Logger, value: R);
    getValue(): R;
    protected computeResult(): R;
}
