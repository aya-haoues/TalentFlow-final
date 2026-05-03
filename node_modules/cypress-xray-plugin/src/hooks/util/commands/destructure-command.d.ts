import type { Logger } from "../../../util/logging";
import type { Computable } from "../../command";
import { Command } from "../../command";
interface CommandParameters {
    accessor: number | string | symbol;
}
export declare class DestructureCommand<R> extends Command<R, CommandParameters> {
    private readonly input;
    constructor(logger: Logger, input: Computable<Record<number | string | symbol, R>>, accessor: number | string | symbol);
    protected computeResult(): Promise<R>;
}
export {};
