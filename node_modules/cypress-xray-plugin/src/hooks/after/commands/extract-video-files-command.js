"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractVideoFilesCommand = void 0;
const command_1 = require("../../command");
class ExtractVideoFilesCommand extends command_1.Command {
    constructor(logger, cypressRunResult) {
        super(null, logger);
        this.cypressRunResult = cypressRunResult;
    }
    async computeResult() {
        const cypressRunResult = await this.cypressRunResult.compute();
        const videos = cypressRunResult.runs
            .map((run) => {
            return run.video;
        })
            .filter((value) => typeof value === "string");
        return videos;
    }
}
exports.ExtractVideoFilesCommand = ExtractVideoFilesCommand;
