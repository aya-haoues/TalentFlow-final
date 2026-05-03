import type { Background, Comment } from "@cucumber/messages";
/**
 * Extracts all comments which are relevant for linking a background to precondition issues.
 *
 * @param background - the background
 * @param comments - the feature file comments
 * @returns the relevant comments
 */
export declare function getCucumberPreconditionIssueComments(background: Background, comments: readonly Comment[]): string[];
export declare function getCucumberPreconditionIssueTags(background: Background, projectKey: string, comments: readonly string[], preconditionPrefix?: string): string[];
