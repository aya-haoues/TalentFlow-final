import type { GherkinDocument } from "@cucumber/messages";
import { Command } from "../../command";
interface Parameters {
    filePath: string;
}
export declare class ParseFeatureFileCommand extends Command<GherkinDocument, Parameters> {
    protected computeResult(): GherkinDocument;
}
export {};
