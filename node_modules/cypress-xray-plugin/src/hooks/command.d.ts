import type { Logger } from "../util/logging";
/**
 * Models an entity which can compute a result.
 */
export interface Computable<R> {
    /**
     * Computes the result.
     *
     * @returns the result
     */
    compute: () => Promise<R> | R;
}
export interface Failable {
    /**
     * Returns the reason why the entity failed.
     *
     * @returns the error or `undefined` if there was no failure
     */
    getFailure: () => Error | undefined;
}
/**
 * Models the different states of a command.
 */
export declare enum ComputableState {
    /**
     * The command encountered problems during execution.
     */
    FAILED = "failed",
    /**
     * The command has neither been told to compute, nor is it done computing.
     */
    INITIAL = "initial",
    /**
     * The command has been told to compute but is not yet done computing.
     */
    PENDING = "pending",
    /**
     * The command was skipped.
     */
    SKIPPED = "skipped",
    /**
     * The command is done computing.
     */
    SUCCEEDED = "succeeded"
}
export interface Stateful<S> {
    /**
     * Returns the state the object is currently in.
     *
     * @returns the state
     */
    getState(): S;
    /**
     * Sets the object's state to the new state.
     *
     * @param state - the new state
     */
    setState(state: S): void;
}
/**
 * Models a generic command. The command only starts doing something when
 * {@link compute | `compute`} is triggered.
 */
export declare abstract class Command<R = unknown, P = unknown> implements Computable<R>, Stateful<ComputableState>, Failable {
    /**
     * The command's parameters.
     */
    protected readonly parameters: P;
    /**
     * The logger to use for printing progress, failure or success messages.
     */
    protected readonly logger: Logger;
    private readonly result;
    private readonly executeEmitter;
    private state;
    private failureOrSkipReason;
    /**
     * Constructs a new command.
     *
     * @param parameters - the command parameters
     * @param logger - the logger to use for log messages
     */
    constructor(parameters: P, logger: Logger);
    compute(): Promise<R>;
    /**
     * Returns the command's parameters.
     *
     * @returns the parameters
     */
    getParameters(): P;
    getState(): ComputableState;
    setState(state: ComputableState): void;
    getFailure(): Error | undefined;
    getLogger(): Logger;
    /**
     * Computes the command's result.
     *
     * @returns the result
     */
    protected abstract computeResult(): Promise<R> | R;
}
