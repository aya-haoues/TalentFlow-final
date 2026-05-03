"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantCommand = void 0;
const command_1 = require("../../command");
class ConstantCommand extends command_1.Command {
    constructor(logger, value) {
        super(null, logger);
        this.value = value;
    }
    getValue() {
        return this.value;
    }
    computeResult() {
        return this.getValue();
    }
}
exports.ConstantCommand = ConstantCommand;
