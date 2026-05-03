import type { AxiosRestClient } from "../https/requests";
/**
 * A basic HTTP authorization header.
 *
 * @example
 *
 * ```ts
 * { "Authorization": "Bearer xyz" }
 * ```
 */
interface AuthorizationHeader {
    ["Authorization"]: string;
}
/**
 * The interface which all credential classes must implement. All credentials must be usable in an
 * HTTP authorization request header.
 */
export interface HttpCredentials {
    /**
     * Returns the HTTP authorization header value of the credentials.
     *
     * @returns the HTTP header value
     */
    getAuthorizationHeader(): AuthorizationHeader | Promise<AuthorizationHeader>;
}
/**
 * A basic authorization credentials class, storing base64 encoded credentials of usernames and
 * passwords.
 */
export declare class BasicAuthCredentials implements HttpCredentials {
    private readonly encodedCredentials;
    /**
     * Constructs new basic authorization credentials.
     *
     * @param username - the username
     * @param password - the password
     */
    constructor(username: string, password: string);
    getAuthorizationHeader(): AuthorizationHeader;
}
/**
 * A personal access token (_PAT_) credentials class, storing a secret token to use during HTTP
 * authorization.
 */
export declare class PatCredentials implements HttpCredentials {
    private readonly token;
    /**
     * Constructs new PAT credentials from the provided token.
     *
     * @param token - the token
     */
    constructor(token: string);
    getAuthorizationHeader(): AuthorizationHeader;
}
/**
 * A JWT credentials class, storing a JWT token to use during HTTP authorization. The class is
 * designed to retrieve fresh JWT tokens from an authentication URL/endpoint. Once retrieved, the
 * token will be stored and reused whenever necessary.
 */
export declare class JwtCredentials implements HttpCredentials {
    private token?;
    private readonly clientId;
    private readonly clientSecret;
    private readonly authenticationUrl;
    private readonly httpClient;
    /**
     * Constructs new JWT credentials. The client ID and client secret will be used to retrieve a
     * JWT token from the authentication URL on demand.
     *
     * @param clientId - the client ID
     * @param clientSecret - the client secret
     * @param authenticationUrl - the authentication URL/token endpoint
     * @param httpClient - the HTTP client to use for fetching the token
     */
    constructor(clientId: string, clientSecret: string, authenticationUrl: string, httpClient: AxiosRestClient);
    private fetchToken;
    getAuthorizationHeader(): Promise<AuthorizationHeader>;
    /**
     * Return the URL to authenticate to.
     *
     * @returns the URL
     */
    getAuthenticationUrl(): string;
}
export {};
