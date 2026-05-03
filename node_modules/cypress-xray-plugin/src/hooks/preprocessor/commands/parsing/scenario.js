"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCucumberScenarioIssueTags = getCucumberScenarioIssueTags;
exports.getScenarioTagRegex = getScenarioTagRegex;
function getCucumberScenarioIssueTags(scenario, projectKey, testPrefix) {
    const issueKeys = [];
    for (const tag of scenario.tags) {
        const matches = tag.name.match(getScenarioTagRegex(projectKey, testPrefix));
        if (!matches) {
            continue;
        }
        // We know the regex: the match will contain the value in the first group.
        issueKeys.push(matches[1]);
    }
    return issueKeys;
}
function getScenarioTagRegex(projectKey, testPrefix) {
    if (testPrefix) {
        // @TestName:CYP-123
        return new RegExp(`@${testPrefix}(${projectKey}-\\d+)`);
    }
    // @CYP-123
    return new RegExp(`@(${projectKey}-\\d+)`);
}
