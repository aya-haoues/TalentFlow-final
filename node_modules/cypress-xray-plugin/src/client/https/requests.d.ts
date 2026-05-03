import { type AxiosInstance, type AxiosRequestConfig, type AxiosRequestHeaders, type AxiosResponse } from "axios";
/**
 * Options which affect the way the requests module works.
 */
export interface RequestsOptions {
    /**
     * Turns on or off extensive debugging output.
     */
    debug?: boolean;
    /**
     * The maximum allowed file size in MiB to write when logging requests and responses.
     *
     * @defaultValue 50
     */
    fileSizeLimit?: number;
    /**
     * Additional options for controlling HTTP behaviour.
     */
    http?: AxiosRequestConfig;
    /**
     * Request rate limiting options for this client. If configured, each of the client's requests
     * can be delayed by a certain amount of time depending on the configured rate limiting scheme.
     */
    rateLimiting?: {
        /**
         * Avoids rate limits by delaying requests if sending them would exceed the specified
         * requests per second.
         *
         * @example
         *
         *
         * ```ts
         * // Will send a request at most every 500 milliseconds.
         * {
         *   rateLimiting: {
         *     requestsPerSecond: 2
         *   }
         * }
         * ```
         *
         * ```ts
         * // Will send a request at most every 5 seconds.
         * {
         *   rateLimiting: {
         *     requestsPerSecond: 0.2
         *   }
         * }
         * ```
         */
        requestsPerSecond?: number;
    };
}
/**
 * Models a request that was logged to a file.
 */
export interface LoggedRequest {
    /**
     * The request's body.
     */
    body: unknown;
    /**
     * The request's headers.
     */
    headers: AxiosRequestHeaders;
    /**
     * The request's parameters.
     */
    params: unknown;
    /**
     * The request's URL.
     */
    url?: string;
}
export declare class AxiosRestClient {
    private readonly options;
    private readonly createdLogFiles;
    private readonly axios;
    private lastRequestTime;
    constructor(axios: AxiosInstance, options?: RequestsOptions);
    get<R>(url: string, config?: AxiosRequestConfig<unknown>): Promise<AxiosResponse<R>>;
    post<R, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<AxiosResponse<R>>;
    put<R, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<AxiosResponse<R>>;
    private logRequest;
    private logResponse;
    private logError;
    private startResponseInterval;
    private appendSuffix;
    private delayIfNeeded;
}
