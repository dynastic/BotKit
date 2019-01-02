"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Constants_1 = __importDefault(require("../Constants"));
require("./api");
const arguments_1 = require("./guards/arguments");
var AccessLevel;
(function (AccessLevel) {
    AccessLevel["EVERYONE"] = "global";
    AccessLevel["MODERATOR"] = "moderator";
    AccessLevel["ADMIN"] = "admin";
    AccessLevel["ROOT"] = "root";
})(AccessLevel = exports.AccessLevel || (exports.AccessLevel = {}));
class CommandBuilder {
    constructor() {
        this.command = {};
    }
    name(name) {
        this.opts.name = name;
        return this;
    }
    enabled(enabled) {
        this.opts.enabled = enabled;
        return this;
    }
    alias(alias) {
        this.opts.aliases = (this.opts.aliases || (this.opts.aliases = [])).concat(alias);
        return this;
    }
    data(key, value) {
        (this.opts.data || (this.opts.data = {}))[key] = value;
        return this;
    }
    access(access) {
        this.opts.access = access;
        return this;
    }
    guard(guard) {
        this.opts.guards = (this.opts.guards || (this.opts.guards = [])).concat(guard);
    }
    category(category) {
        this.opts.category = category;
    }
    handler(handler) {
        this.command.handler = handler;
    }
    get opts() {
        return this.command.opts || (this.command.opts = {});
    }
    get built() {
        return this.command;
    }
}
exports.CommandBuilder = CommandBuilder;
var CommandUtils;
(function (CommandUtils) {
    function isCommandOptions(options) {
        return typeof options === "undefined" ? true :
            (typeof options.access === "undefined" || typeof options.access === "number") &&
                (typeof options.guards === "undefined" || (Array.isArray(options.guards) && options.guards.every(guard => typeof guard === "function")));
    }
    CommandUtils.isCommandOptions = isCommandOptions;
    function isCommand(command) {
        return typeof command.opts === "object" &&
            typeof command.opts.name === "string" &&
            (typeof command.opts.enabled === "boolean" || typeof command.opts.enabled === "undefined") &&
            isCommandOptions(command.options) &&
            typeof command.handler === "function";
    }
    CommandUtils.isCommand = isCommand;
    function isCommands(commands) {
        return (typeof commands.opts === "undefined" || isCommandOptions(commands.opts)) &&
            (typeof commands.commands === "object" && Array.isArray(commands.commands));
    }
    CommandUtils.isCommands = isCommands;
    /**
     * Flattens a commands object into a command array
     *
     * @param param0 the commands to flatten
     */
    async function flatten({ opts, commands }) {
        let commandArray = [];
        for (let command of commands) {
            // prevents modifications to the require.cache'd objects
            command = Object.assign({}, command);
            command.opts = command.opts ? Object.assign({}, command.opts) : {};
            if (command.opts)
                command.opts.guards = [...(command.opts.guards || [])];
            if (!opts) {
                isCommand(command) ? commandArray.push(command) : commandArray = commandArray.concat(await flatten(command));
                continue;
            }
            const { guards, access, category } = opts;
            // guards have a hierarchy
            if (guards) {
                command.opts.guards = guards.concat(command.opts.guards || []);
            }
            // commands inherit access levels if they don't have one defined
            if (access && !command.opts.access) {
                command.opts.access = access;
            }
            if (typeof category === "string" && typeof command.opts.category === "undefined") {
                command.opts.category = category;
            }
            if (isCommand(command)) {
                // our work is done
                commandArray.push(command);
            }
            else {
                // recursion!
                commandArray = commandArray.concat(await flatten(command));
            }
        }
        return commandArray;
    }
    CommandUtils.flatten = flatten;
    /**
     * Parses a POJSO and converts it to an array of commands
     *
     * @param module the plain object to parse
     */
    async function parse(module, base = true) {
        // exports = {opts: {}, handler: () => any}
        if (isCommand(module)) {
            return [module];
        }
        // exports = {opts: {}, commands: []}
        if (module.commands) {
            return await flatten(module);
        }
        let commands = [];
        if (base) {
            for (let key in module) {
                const value = module[key];
                commands = commands.concat(await parse(value, false));
            }
        }
        return commands;
    }
    CommandUtils.parse = parse;
    async function preloadMetadata(commands) {
        commands.forEach(command => {
            if (command.opts.usage) {
                (command.opts.guards || (command.opts.guards = [])).unshift(arguments_1.Argumented(command));
            }
        });
    }
    CommandUtils.preloadMetadata = preloadMetadata;
    /**
     * Parses a directory and all of it's sub-directories for commands.
     *
     * @param dir the path to the directory
     */
    async function loadDirectory(dir, automaticCategoryNames) {
        let contents = await fs_extra_1.default.readdir(dir), commands = [];
        for (let content of contents) {
            const location = path_1.default.resolve(dir, content);
            const stat = await fs_extra_1.default.stat(location);
            // commands must be .js files
            if (stat.isFile() && !location.endsWith(".js"))
                continue;
            const newCommands = stat.isDirectory() ? await loadDirectory(location) : await parse(require(location));
            if (automaticCategoryNames) {
                let parentDirName = path_1.default.dirname(location).split('/');
                parentDirName = parentDirName[parentDirName.length - 1];
                for (let command of newCommands) {
                    if (!!command.opts.category)
                        continue;
                    command.opts.category = parentDirName;
                }
            }
            commands = commands.concat(newCommands);
        }
        return commands;
    }
    CommandUtils.loadDirectory = loadDirectory;
    /**
     * Adds middleware which take priority over existing middleware to commands
     * @param commands commands to add middleware to
     * @param middleware middleware to add
     */
    async function prependMiddleware(commands, ...middleware) {
        for (let command of commands) {
            (command.opts.guards || (command.opts.guards = [])).unshift(...middleware);
        }
    }
    CommandUtils.prependMiddleware = prependMiddleware;
    /**
     * Executes all middleware on a commmand, resolves when done
     * @param message
     * @param middleware
     * @returns whether this was successful
     */
    function executeMiddleware(message, middleware) {
        return new Promise((resolve, reject) => {
            let idx = -1;
            const next = async (err) => {
                if (err) {
                    // send error down the chain
                    return reject(err);
                }
                idx++;
                if (!middleware[idx])
                    return resolve();
                // allows guards to throw CommandErrors and sends it down the chain
                try {
                    await middleware[idx](message, next);
                }
                catch (e) {
                    return reject(e);
                }
            };
            next();
        });
    }
    CommandUtils.executeMiddleware = executeMiddleware;
    /**
     * Adds bot branding to an embed
     * @param embed embed to brand
     */
    CommandUtils.specializeEmbed = (embed) => {
        if (embed instanceof discord_js_1.RichEmbed)
            embed.setFooter(Constants_1.default.BOT_AUTHOR, Constants_1.default.BOT_ICON);
        else
            embed.footer = { text: Constants_1.default.BOT_AUTHOR, icon_url: Constants_1.default.BOT_ICON };
        return embed;
    };
    async function runCommand(baseMessage, command, user) {
        const actionLog = [];
        user = user || baseMessage.author;
        const trackAction = result => {
            actionLog.push(result);
            return baseMessage;
        };
        command = `${Constants_1.default.COMMAND_PREFIX}${command}`;
        baseMessage = new discord_js_1.Message(baseMessage.channel, { ...baseMessage.__data, author: user }, baseMessage.client);
        baseMessage.id = null;
        baseMessage.content = command;
        baseMessage.pinned = false;
        baseMessage.tts = false;
        baseMessage.embeds = [];
        baseMessage.attachments = new discord_js_1.Collection();
        baseMessage.createdTimestamp = new Date().getTime();
        baseMessage.editedTimestamp = null;
        baseMessage.reactions = new discord_js_1.Collection();
        baseMessage.mentions = new discord_js_1.MessageMentions(baseMessage);
        baseMessage.webhookID = null;
        baseMessage.delete = async () => trackAction({ deleted: true });
        baseMessage.reply = async (...args) => trackAction({ reply: args });
        baseMessage.edit = async (...args) => trackAction({ edit: args });
        baseMessage.pin = async () => trackAction({ pinned: true });
        baseMessage.unpin = async () => trackAction({ unpinned: true });
        baseMessage.complete = baseMessage.success = baseMessage.done = async () => trackAction({ completed: true });
        baseMessage.warning = baseMessage.danger = baseMessage.caution = async () => trackAction({ warning: true });
        baseMessage.renderError = async (error) => trackAction({ error });
        await baseMessage.client.botkit.commandSystem.messageIntake(baseMessage);
        return actionLog.reduce((obj, c) => {
            Object.keys(c).forEach(key => obj[key] = c[key]);
            return obj;
        }, {});
    }
    CommandUtils.runCommand = runCommand;
})(CommandUtils = exports.CommandUtils || (exports.CommandUtils = {}));
//# sourceMappingURL=util.js.map