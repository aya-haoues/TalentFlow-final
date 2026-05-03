"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackCommand = void 0;
const command_1 = require("../../command");
class FallbackCommand extends command_1.Command {
    constructor(parameters, logger, input) {
        super(parameters, logger);
        this.input = input;
    }
    async computeResult() {
        if (this.parameters.fallbackOn.includes(this.input.getState())) {
            return this.parameters.fallbackValue;
        }
        return await this.input.compute();
    }
}
exports.FallbackCommand = FallbackCommand;
