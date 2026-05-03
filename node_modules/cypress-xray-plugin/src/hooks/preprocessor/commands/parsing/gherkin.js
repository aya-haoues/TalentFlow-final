"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFeatureFile = parseFeatureFile;
const gherkin_1 = require("@cucumber/gherkin");
const messages_1 = require("@cucumber/messages");
const fs_1 = __importDefault(require("fs"));
/**
 * Parses a Gherkin document (feature file) and returns the information contained within.
 *
 * @param file - the path to the feature file
 * @param encoding - the file's encoding
 * @returns an object containing the data of the feature file
 * @example
 *   const data = parseFeatureFile("myTetest.feature")
 *   console.log(data.feature.children[0].scenario); // steps, name, ...
 * @see https://github.com/cucumber/messages/blob/main/javascript/src/messages.ts
 */
function parseFeatureFile(file, encoding = "utf-8") {
    const uuidFn = messages_1.IdGenerator.uuid();
    const builder = new gherkin_1.AstBuilder(uuidFn);
    const matcher = new gherkin_1.GherkinClassicTokenMatcher();
    const parser = new gherkin_1.Parser(builder, matcher);
    return parser.parse(fs_1.default.readFileSync(file, { encoding: encoding }));
}
