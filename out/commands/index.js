"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandUtil = __importStar(require("./util"));
const Constants_1 = __importDefault(require("../Constants"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("./errors");
const permissions_1 = require("./guards/permissions");
const stripStartEnd = (token, str) => {
    if (str.startsWith(token) && str.endsWith(token))
        str = str.substring(token.length, str.length - token.length);
    return str;
};
/**
 * A system which loads and tracks commands
 */
class CommandSystem {
    constructor(options) {
        this.options = options;
        this.commands = {};
        /**
         * Guards to run on all commands
         */
        this.globalGuards = [];
        this.globalGuards = [permissions_1.PermissionsGuard];
        options.app.client.on("message", message => this.messageIntake(message));
    }
    async messageIntake(message) {
        if (typeof message.isCommand === "undefined") {
            message.isCommand = message.content.startsWith(Constants_1.default.COMMAND_PREFIX);
        }
        if (!message.isCommand)
            return;
        if (!message.args) {
            message.args = message.content.substring(Constants_1.default.COMMAND_PREFIX.length).trim().match(Constants_1.default.ARGUMENT_REGEX) || [];
            for (let i = 0; i < message.args.length; i++) {
                message.args[i] = stripStartEnd('"', message.args[i]);
                message.args[i] = stripStartEnd("'", message.args[i]);
            }
        }
        if (message.args.length === 0)
            return;
        if (!message.command) {
            message.command = this.options.app.commandSystem.commands[message.args[0]];
            message.args.shift();
        }
        if (!message.cleanContent.startsWith(Constants_1.default.COMMAND_PREFIX))
            return;
        await this.executeCommand(message);
    }
    /**
     * Loads commands into the tracking system
     */
    async init() {
        let commands = this.options.directory ? await CommandUtil.CommandUtils.loadDirectory(this.options.directory, this.options.automaticCategoryNames) : [];
        commands = commands.concat(await CommandUtil.CommandUtils.parse(require(path_1.default.resolve(__dirname, "commands"))));
        await this.loadCommands(commands);
    }
    async loadCommands(commands) {
        if (!Array.isArray(commands)) {
            commands = await CommandUtil.CommandUtils.flatten(commands);
        }
        await CommandUtil.CommandUtils.preloadMetadata(commands);
        for (let command of commands) {
            if (this.options.preloadExclude && this.options.preloadExclude.includes(command.opts.name))
                continue;
            this.commands[command.opts.name] = command;
            if (command.opts.aliases) {
                for (let alias of command.opts.aliases) {
                    this.commands[alias] = command;
                }
            }
        }
    }
    /**
     * Executes the command initiated by the message
     * @param message the message initiating a command
     */
    async executeCommand(message) {
        const sendError = async (error) => {
            if (!error)
                return;
            if (error instanceof errors_1.CommandError) {
                return await message.renderError(error);
            }
            /**
             * @todo tracking
             */
            console.error(error);
            await message.renderError(errors_1.CommandError.GENERIC({}));
        };
        const command = message.command;
        if (!command || command.opts.enabled === false) {
            await message.renderError(new errors_1.CommandError({
                message: `That command doesn't exist! Try \`${Constants_1.default.COMMAND_PREFIX}help\` for a list of commands.`,
                title: "Unknown command"
            }));
            return;
        }
        try {
            await CommandUtil.CommandUtils.executeMiddleware(message, this.globalGuards.concat(command.opts.guards || []));
            if (message.errored)
                return;
            await command.handler(message, sendError);
        }
        catch (e) {
            return await sendError(e);
        }
    }
}
exports.default = CommandSystem;
__export(require("./util"));
__export(require("./guards"));
__export(require("./errors"));
__export(require("./permissions"));
//# sourceMappingURL=index.js.map