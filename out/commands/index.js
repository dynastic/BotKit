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
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const CommandUtil = __importStar(require("./util"));
const Constants_1 = require("../Constants");
const path_1 = __importDefault(require("path"));
const errors_1 = require("./errors");
const guards_1 = require("./guards");
const stripStartEnd = (token, str) => {
    if (str.startsWith(token) && str.endsWith(token))
        str = str.substring(token.length, str.length - token.length);
    return str;
};
class CommandSystem {
    constructor(options) {
        this.options = options;
        this.commands = {};
        this.metadata = {};
        this.globalGuards = [];
        this.globalGuards = [];
        options.app.client.on("message", message => {
            if (typeof message.isCommand === "undefined") {
                message.isCommand = message.content.startsWith(Constants_1.COMMAND_PREFIX);
            }
            if (!message.complete) {
                message.success = message.done = message.complete = function () {
                    return this.react(Constants_1.SUCCESS_EMOJI);
                };
            }
            if (!message.warning) {
                message.danger = message.caution = message.warning = function () {
                    return this.react(Constants_1.WARNING_EMOJI);
                };
            }
            if (!message.fail) {
                message.fail = function () {
                    return this.react(Constants_1.FAIL_EMOJI);
                };
            }
            if (!message.args && message.isCommand) {
                message.args = message.content.substring(Constants_1.COMMAND_PREFIX.length).trim().match(Constants_1.ARGUMENT_REGEX);
                for (let i = 0; i < message.args.length; i++) {
                    message.args[i] = stripStartEnd('"', message.args[i]);
                    message.args[i] = stripStartEnd("'", message.args[i]);
                }
            }
            if (!message.command && message.isCommand) {
                message.command = options.app.commandSystem.commands[message.args[0]];
                message.args.shift();
            }
            if (!message.reject) {
                message.reject = function (error) {
                    const { render } = error || errors_1.CommandError.GENERIC({});
                    return this.reply(typeof render === "string" ? render : "", { embed: typeof render === "object" ? render : undefined });
                };
            }
            if (!message.app) {
                message.app = options.app;
            }
        });
    }
    async init() {
        let commands = await CommandUtil.CommandUtils.loadDirectory(this.options.directory);
        commands = commands.concat(await CommandUtil.CommandUtils.parse(require(path_1.default.resolve(__dirname, "commands"))));
        await CommandUtil.CommandUtils.prependMiddleware(commands, guards_1.PermissionGuard);
        for (let command of commands) {
            this.commands[command.opts.name] = command;
            if (command.opts.aliases) {
                for (let alias of command.opts.aliases) {
                    this.commands[alias] = command;
                }
            }
        }
    }
    async executeCommand(message) {
        const sendError = async (error) => {
            if (!error)
                return;
            if (!message.reject)
                message.reject = (err = errors_1.CommandError.GENERIC({})) => {
                    const render = err.render;
                    return message.reply(typeof render === "string" ? render : "", { embed: typeof render === "object" ? render : undefined });
                };
            if (error instanceof errors_1.CommandError) {
                return await message.reject(error);
            }
            /**
             * @todo tracking
             */
            console.error(error);
            await message.reject(errors_1.CommandError.GENERIC({}));
        };
        try {
            await CommandUtil.CommandUtils.executeMiddleware(message, this.globalGuards);
        }
        catch (e) {
            return await sendError(e);
        }
        const command = message.command;
        if (!command || command.opts.enabled === false) {
            await message.reject(new errors_1.CommandError({
                message: `That command doesn't exist! Try \`${Constants_1.COMMAND_PREFIX}help\` for a list of commands.`,
                title: "Unknown command"
            }));
            return;
        }
        try {
            if (command.opts.guards) {
                await CommandUtil.CommandUtils.executeMiddleware(message, command.opts.guards);
            }
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
//# sourceMappingURL=index.js.map