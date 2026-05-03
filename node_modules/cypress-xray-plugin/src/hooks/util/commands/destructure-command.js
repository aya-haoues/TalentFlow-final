"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestructureCommand = void 0;
const command_1 = require("../../command");
class DestructureCommand extends command_1.Command {
    constructor(logger, input, accessor) {
        super({ accessor: accessor }, logger);
        this.input = input;
    }
    async computeResult() {
        const input = await this.input.compute();
        const value = input[this.parameters.accessor];
        if (!value) {
            throw new Error(`Failed to access element ${this.parameters.accessor.toString()} in: ${JSON.stringify(input)}`);
        }
        return value;
    }
}
exports.DestructureCommand = DestructureCommand;
