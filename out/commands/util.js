"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./api");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
const Constants_1 = require("../Constants");
var AccessLevel;
(function (AccessLevel) {
    AccessLevel["EVERYONE"] = "global";
    AccessLevel["MODERATOR"] = "moderator";
    AccessLevel["ADMIN"] = "admin";
    AccessLevel["ROOT"] = "root";
})(AccessLevel = exports.AccessLevel || (exports.AccessLevel = {}));
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
            if (typeof access === "number" && typeof command.opts.access === "undefined") {
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
            embed.setFooter(Constants_1.BOT_AUTHOR, Constants_1.BOT_ICON);
        else
            embed.footer = { text: Constants_1.BOT_AUTHOR, icon_url: Constants_1.BOT_ICON };
        return embed;
    };
})(CommandUtils = exports.CommandUtils || (exports.CommandUtils = {}));
//# sourceMappingURL=util.js.map