/**
 * Decorates the method with an error handler which automatically logs errors and rethrows
 * afterwards.
 *
 * @param parameters - decorator parameters
 * @returns the decorated method
 *
 * @see https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#writing-well-typed-decorators
 * @see https://www.typescriptlang.org/docs/handbook/decorators.html#decorator-factories
 */
export declare function loggedRequest(parameters: {
    /**
     * The human-readable purpose of this method. Will be used for error messages. It should form a
     * complete sentence when read as follows:
     *
     * ```ts
     * `Failed to ${purpose}`
     * ```
     *
     * @example "get users"
     */
    purpose: string;
}): <This, P extends unknown[], R>(target: (this: This, ...args: P) => Promise<R> | R, context: ClassMethodDecoratorContext<This, (this: This, ...args: P) => Promise<R> | R>) => (this: This, ...args: P) => Promise<R>;
