import type { Logger } from "../../../util/logging";
import type { ComputableState } from "../../command";
import { Command } from "../../command";
interface Parameters<T> {
    fallbackOn: ComputableState[];
    fallbackValue: T;
}
export declare class FallbackCommand<T, R> extends Command<R | T, Parameters<T>> {
    private readonly input;
    constructor(parameters: Parameters<T>, logger: Logger, input: Command<R>);
    protected computeResult(): Promise<R | T>;
}
export {};
