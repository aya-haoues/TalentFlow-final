import FormData from "form-data";
import type { XrayTestExecutionResults } from "../../types/xray/import-test-execution-results";
import type { CucumberMultipartFeature } from "../../types/xray/requests/import-execution-cucumber-multipart";
import type { MultipartInfo } from "../../types/xray/requests/import-execution-multipart-info";
import type { ImportFeatureResponse } from "../../types/xray/responses/import-feature";
import { Client } from "../client";
export interface XrayClient {
    /**
     * Uploads test results to the Xray instance.
     *
     * @param execution - the test results as provided by Cypress
     * @returns the key of the test execution issue
     * @see https://docs.getxray.app/display/XRAYCLOUD/Import+Execution+Results+-+REST+v2
     */
    importExecution(execution: XrayTestExecutionResults): Promise<string>;
    /**
     * Uploads Cucumber test results to the Xray instance.
     *
     * @param cucumberJson - the test results as provided by the `cypress-cucumber-preprocessor`
     * @param cucumberInfo - the test execution information
     * @returns the key of the test execution issue
     * @see https://docs.getxray.app/display/XRAY/Import+Execution+Results+-+REST#ImportExecutionResultsREST-CucumberJSONresultsMultipart
     * @see https://docs.getxray.app/display/XRAYCLOUD/Import+Execution+Results+-+REST+v2
     */
    importExecutionCucumberMultipart(cucumberJson: CucumberMultipartFeature[], cucumberInfo: MultipartInfo): Promise<string>;
    /**
     * Uploads test results to the Xray instance while also allowing modification of arbitrary Jira
     * fields.
     *
     * @param executionResults - the test results as provided by Cypress
     * @param info - the Jira test execution issue information
     * @returns the key of the test execution issue
     * @see https://docs.getxray.app/display/XRAY/Import+Execution+Results+-+REST#ImportExecutionResultsREST-XrayJSONresultsMultipart
     * @see https://docs.getxray.app/display/XRAYCLOUD/Import+Execution+Results+-+REST+v2#ImportExecutionResultsRESTv2-XrayJSONresultsMultipart
     */
    importExecutionMultipart(executionResults: XrayTestExecutionResults, info: MultipartInfo): Promise<string>;
    /**
     * Uploads (zipped) feature file(s) to corresponding Xray issues.
     *
     * @param file - the (zipped) Cucumber feature file(s)
     * @param query - the query parameters
     * @returns the response containing updated issues
     * @see https://docs.getxray.app/display/XRAY/Importing+Cucumber+Tests+-+REST
     * @see https://docs.getxray.app/display/XRAYCLOUD/Importing+Cucumber+Tests+-+REST+v2
     */
    importFeature(file: string, query: {
        /**
         * The ID of the project where the tests and pre-conditions are located.
         */
        projectId?: string;
        /**
         * The key of the project where the tests and pre-conditions are located.
         */
        projectKey?: string;
        /**
         * A name designating the source of the features being imported (e.g. the source
         * project name).
         */
        source?: string;
    }): Promise<ImportFeatureResponse>;
}
/**
 * An abstract Xray client class for communicating with Xray instances.
 */
export declare abstract class AbstractXrayClient<ImportFeatureResponseType, ImportExecutionResponseType> extends Client implements XrayClient {
    importExecution(execution: XrayTestExecutionResults): Promise<string>;
    importExecutionMultipart(executionResults: XrayTestExecutionResults, info: MultipartInfo): Promise<string>;
    importExecutionCucumberMultipart(cucumberJson: CucumberMultipartFeature[], cucumberInfo: MultipartInfo): Promise<string>;
    importFeature(file: string, query: {
        projectId?: string;
        projectKey?: string;
        source?: string;
    }): Promise<ImportFeatureResponse>;
    private getUrlImportFeature;
    private getUrlImportExecution;
    private getUrlImportExecutionCucumberMultipart;
    private getUrlImportExecutionMultipart;
    /**
     * Prepares the Cucumber multipart import execution form data.
     *
     * @param event - the event
     * @param cucumberJson - the test results as provided by the `cypress-cucumber-preprocessor`
     * @param cucumberInfo - the test execution information
     * @returns the form data
     */
    protected abstract onRequest(event: "import-execution-cucumber-multipart", cucumberJson: CucumberMultipartFeature[], cucumberInfo: MultipartInfo): FormData;
    /**
     * Prepares the import execution multipart form data.
     *
     * @param event - the event
     * @param executionResults - the test results as provided by Cypress
     * @param info - the Jira test execution issue information
     * @returns the form data
     */
    protected abstract onRequest(event: "import-execution-multipart", executionResults: XrayTestExecutionResults, info: MultipartInfo): FormData;
    /**
     * Handles the import feature response and transforms it into a consolidated object.
     *
     * @param event - the event
     * @param response - the response depending on the concrete Xray version
     * @returns the consolidated response
     */
    protected abstract onResponse(event: "import-feature", response: ImportFeatureResponseType): ImportFeatureResponse;
    /**
     * Handles the import execution results response and transforms it into a consolidated object.
     *
     * @param event - the event
     * @param response - the response depending on the concrete Xray version
     * @returns the test execution issue key
     */
    protected abstract onResponse(event: "import-execution-cucumber-multipart" | "import-execution-multipart" | "import-execution", response: ImportExecutionResponseType): string;
}
