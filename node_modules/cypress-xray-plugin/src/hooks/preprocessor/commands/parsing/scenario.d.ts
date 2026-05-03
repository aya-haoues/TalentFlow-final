import type { Scenario } from "@cucumber/messages";
export declare function getCucumberScenarioIssueTags(scenario: Scenario, projectKey: string, testPrefix?: string): string[];
export declare function getScenarioTagRegex(projectKey: string, testPrefix?: string): RegExp;
