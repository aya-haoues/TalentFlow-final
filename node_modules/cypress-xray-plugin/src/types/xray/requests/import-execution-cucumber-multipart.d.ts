import type { MultipartInfo } from "./import-execution-multipart-info";
export interface CucumberMultipart {
    features: CucumberMultipartFeature[];
    info: MultipartInfo;
}
export interface CucumberMultipartFeature {
    description: string;
    elements: CucumberMultipartElement[];
    id: string;
    keyword: string;
    line: number;
    name: string;
    tags?: CucumberMultipartTag[];
    uri: string;
}
export interface CucumberMultipartElement {
    after?: CucumberMultipartHook[];
    before?: CucumberMultipartHook[];
    description: string;
    id?: string;
    keyword: string;
    line: number;
    name: string;
    steps: CucumberMultipartStep[];
    tags?: CucumberMultipartTag[];
    type: "background" | "scenario";
}
export interface CucumberMultipartStep {
    ["doc_string"]?: CucumberMultipartDocString;
    embeddings?: CucumberMultipartEmbedding[];
    keyword: string;
    line: number;
    match?: CucumberMultipartMatch;
    name: string;
    output?: string;
    result: CucumberMultipartStepResult;
    rows?: CucumberMultipartDataTableRow[];
}
export interface CucumberMultipartDocString {
    ["content_type"]: string;
    line: number;
    value: string;
}
export interface CucumberMultipartDataTableRow {
    cells: string[];
}
export interface CucumberMultipartStepResult {
    duration?: number;
    ["error_message"]?: string;
    status: string;
}
export interface CucumberMultipartMatch {
    arguments?: CucumberMultipartArgument[];
    location: string;
}
export interface CucumberMultipartTag {
    line?: number;
    name: string;
}
export interface CucumberMultipartHook {
    match?: CucumberMultipartMatch;
    result: CucumberMultipartStepResult;
}
export interface CucumberMultipartArgument {
    offset: number;
    value: string;
}
export interface CucumberMultipartEmbedding {
    data: string;
    ["mime_type"]: string;
}
