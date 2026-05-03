"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCucumberPreconditionIssueComments = getCucumberPreconditionIssueComments;
exports.getCucumberPreconditionIssueTags = getCucumberPreconditionIssueTags;
/**
 * Extracts all comments which are relevant for linking a background to precondition issues.
 *
 * @param background - the background
 * @param comments - the feature file comments
 * @returns the relevant comments
 */
function getCucumberPreconditionIssueComments(background, comments) {
    if (background.steps.length === 0) {
        return [];
    }
    const backgroundLine = background.location.line;
    const firstStepLine = background.steps[0].location.line;
    return comments
        .filter((comment) => comment.location.line > backgroundLine)
        .filter((comment) => comment.location.line < firstStepLine)
        .map((comment) => comment.text.trim());
}
function getCucumberPreconditionIssueTags(background, projectKey, comments, preconditionPrefix) {
    const preconditionKeys = [];
    if (background.steps.length > 0) {
        for (const comment of comments) {
            const matches = comment.match(getBackgroundTagRegex(projectKey, preconditionPrefix));
            if (!matches) {
                continue;
            }
            // We know the regex: the match will contain the value in the first group.
            preconditionKeys.push(matches[1]);
        }
    }
    return preconditionKeys;
}
function getBackgroundTagRegex(projectKey, preconditionPrefix) {
    if (preconditionPrefix) {
        // @Precondition:CYP-111
        return new RegExp(`@${preconditionPrefix}(${projectKey}-\\d+)`);
    }
    // @CYP-111
    return new RegExp(`@(${projectKey}-\\d+)`);
}
