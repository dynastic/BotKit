"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
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
    async function loadDirectory(dir) {
        let contents = await fs_extra_1.default.readdir(dir), commands = [];
        for (let content of contents) {
            const location = path_1.default.resolve(dir, content);
            const stat = await fs_extra_1.default.stat(location);
            // commands must be .js files
            if (stat.isFile() && !location.endsWith(".js"))
                continue;
            commands = commands.concat(stat.isDirectory() ? await loadDirectory(location) : await parse(require(location)));
        }
        return commands;
    }
    CommandUtils.loadDirectory = loadDirectory;
    async function prependMiddleware(commands, ...middleware) {
        for (let command of commands) {
            (command.opts.guards || (command.opts.guards = [])).unshift(...middleware);
        }
    }
    CommandUtils.prependMiddleware = prependMiddleware;
    function executeMiddleware(message, middleware) {
        return new Promise((resolve, reject) => {
            let idx = -1;
            const next = (err) => {
                if (err) {
                    return reject(err);
                }
                idx++;
                if (!middleware[idx])
                    return resolve();
                middleware[idx](message, next);
            };
            next();
        });
    }
    CommandUtils.executeMiddleware = executeMiddleware;
})(CommandUtils = exports.CommandUtils || (exports.CommandUtils = {}));
exports.specializeEmbed = (embed) => {
    if (embed instanceof discord_js_1.RichEmbed)
        embed.setFooter("Dynastic", Constants_1.DYNASTIC_ICON);
    else
        embed.footer = { text: "Dynastic", icon_url: Constants_1.DYNASTIC_ICON };
    return embed;
};
//# sourceMappingURL=util.js.map