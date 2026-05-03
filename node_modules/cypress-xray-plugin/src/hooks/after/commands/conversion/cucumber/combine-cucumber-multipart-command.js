"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombineCucumberMultipartCommand = void 0;
const command_1 = require("../../../../command");
class CombineCucumberMultipartCommand extends command_1.Command {
    constructor(logger, cucumberMultipartInfo, cucumberMultipartFeatures) {
        super(null, logger);
        this.cucumberMultipartInfo = cucumberMultipartInfo;
        this.cucumberMultipartFeatures = cucumberMultipartFeatures;
    }
    async computeResult() {
        const cucumberMultipartInfo = await this.cucumberMultipartInfo.compute();
        const cucumberMultipartFeatures = await this.cucumberMultipartFeatures.compute();
        return {
            features: cucumberMultipartFeatures,
            info: cucumberMultipartInfo,
        };
    }
}
exports.CombineCucumberMultipartCommand = CombineCucumberMultipartCommand;
