"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.ComputableState = void 0;
const events_1 = require("events");
const errors_1 = require("../util/errors");
const string_1 = require("../util/string");
/**
 * Models the different states of a command.
 */
var ComputableState;
(function (ComputableState) {
    /**
     * The command encountered problems during execution.
     */
    ComputableState["FAILED"] = "failed";
    /**
     * The command has neither been told to compute, nor is it done computing.
     */
    ComputableState["INITIAL"] = "initial";
    /**
     * The command has been told to compute but is not yet done computing.
     */
    ComputableState["PENDING"] = "pending";
    /**
     * The command was skipped.
     */
    ComputableState["SKIPPED"] = "skipped";
    /**
     * The command is done computing.
     */
    ComputableState["SUCCEEDED"] = "succeeded";
})(ComputableState || (exports.ComputableState = ComputableState = {}));
/**
 * Models a generic command. The command only starts doing something when
 * {@link compute | `compute`} is triggered.
 */
class Command {
    /**
     * Constructs a new command.
     *
     * @param parameters - the command parameters
     * @param logger - the logger to use for log messages
     */
    constructor(parameters, logger) {
        this.executeEmitter = new events_1.EventEmitter();
        this.state = ComputableState.INITIAL;
        this.failureOrSkipReason = undefined;
        this.parameters = parameters;
        this.logger = logger;
        this.result = new Promise((resolve) => this.executeEmitter.once("execute", resolve))
            .then(this.computeResult.bind(this))
            .then((result) => {
            this.setState(ComputableState.SUCCEEDED);
            return result;
        })
            .catch((error) => {
            if (error instanceof Error) {
                if ((0, errors_1.isSkippedError)(error)) {
                    this.setState(ComputableState.SKIPPED);
                }
                else {
                    this.setState(ComputableState.FAILED);
                }
                this.failureOrSkipReason = error;
            }
            else {
                this.setState(ComputableState.FAILED);
                this.failureOrSkipReason = new Error((0, string_1.unknownToString)(error));
            }
            throw this.failureOrSkipReason;
        });
    }
    async compute() {
        if (this.state === ComputableState.INITIAL) {
            this.state = ComputableState.PENDING;
            this.executeEmitter.emit("execute");
        }
        return await this.result;
    }
    /**
     * Returns the command's parameters.
     *
     * @returns the parameters
     */
    getParameters() {
        return this.parameters;
    }
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = state;
    }
    getFailure() {
        return this.failureOrSkipReason;
    }
    getLogger() {
        return this.logger;
    }
}
exports.Command = Command;
