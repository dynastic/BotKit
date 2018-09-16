import "./api";

import fs from "fs-extra";
import path, { resolve } from "path";
import {Collection, Guild, Message, RichEmbed, RichEmbedOptions} from "discord.js";
import {CommandError} from "./errors";
import Application from "..";
import { BOT_ICON, BOT_AUTHOR } from "../Constants";

export enum AccessLevel {
    EVERYONE = "global",
    MODERATOR = "moderator",
    ADMIN = "admin",
    ROOT = "root"
}

declare module 'discord.js' {
    interface GuildMember {
        /**
         * Whether this member has access to the given command
         * @param command the command name
         */
        hasAccess(command: string): Promise<boolean>;
    }

    interface User {
        /**
         * Whether this user has access to the given command
         * @param command the command name
         */
        hasAccess(command: string): Promise<boolean>;
        /**
         * Returns all visible guilds this user is in
         */
        guilds(): Promise<Collection<string, Guild>>;
    }

    interface Message {
        /**
         * Reacts with a success emoji
         */
        complete(): Promise<void>;
        /**
         * Reacts with a success emoji
         */
        success(): Promise<void>;
        /**
         * Reacts with a success emoji
         */
        done(): Promise<void>;
        /**
         * Reacts with a failure emoji
         */
        fail(): Promise<void>;
        /**
         * 
         */
        reject(error?: CommandError | undefined): Promise<void>;
        /**
         * Reacts with a warning indicator
         */
        warning(): Promise<void>;
        /**
         * Reacts with a warning indicator
         */
        caution(): Promise<void>;
        /**
         * Reacts with a warning indicator
         */
        danger(): Promise<void>;
        /**
         * The arguments provided for this command
         */
        args: string[];
        /**
         * The command being executd by this message
         */
        command: Command;
        /**
         * The app
         */
        app: Application;
        /**
         * Whether this message is executing a command
         */
        isCommand: boolean;
        /**
         * Command data store
         */
        data: {
            [key: string]: any;
        };
    }
}

export interface CommandHandler {
    (message: Message, next: (err?: any) => any): any;
}

export interface CommandOptions {
    access?: AccessLevel;
    guards?: CommandHandler[];
    category?: string;
}

export interface Command {
    opts: {
        name: string;
        enabled?: boolean;
        aliases?: string[];
        /**
         * Storage for guards and command states
         */
        data?: {[key: string]: any};
    } & CommandOptions;
    handler: CommandHandler;
}

export interface Commands {
    opts?: CommandOptions;
    commands: Array<Command | Commands>;
}

export namespace CommandUtils {
    export function isCommandOptions(options: any): options is CommandOptions {
        return typeof options === "undefined" ? true :
            (typeof options.access === "undefined" || typeof options.access === "number") &&
            (typeof options.guards === "undefined" || (Array.isArray(options.guards) && (options.guards as any[]).every(guard => typeof guard === "function")))
    }
    
    export function isCommand(command: any): command is Command {
        return typeof command.opts === "object" &&
               typeof command.opts.name === "string" &&
               (typeof command.opts.enabled === "boolean" || typeof command.opts.enabled === "undefined") &&
               isCommandOptions(command.options) &&
               typeof command.handler === "function";
    }
    
    export function isCommands(commands: any): commands is Commands {
        return (typeof commands.opts === "undefined" || isCommandOptions(commands.opts)) &&
               (typeof commands.commands === "object" && Array.isArray(commands.commands));
    }

    /**
     * Flattens a commands object into a command array
     * 
     * @param param0 the commands to flatten
     */
    export async function flatten({opts, commands}: Commands): Promise<Command[]> {
        let commandArray: Command[] = [];

        for (let command of commands) {
            // prevents modifications to the require.cache'd objects
            command = Object.assign({}, command);
            command.opts = command.opts ? Object.assign({}, command.opts) : {};
            if (command.opts) command.opts.guards = [...(command.opts.guards || [])];

            if (!opts) {
                isCommand(command) ? commandArray.push(command) : commandArray = commandArray.concat(await flatten(command));
                continue;
            }

            const {guards, access, category} = opts;

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
            } else {
                // recursion!
                commandArray = commandArray.concat(await flatten(command));
            }
        }

        return commandArray;
    }

    /**
     * Parses a POJSO and converts it to an array of commands
     * 
     * @param module the plain object to parse
     */
    export async function parse(module: any, base: boolean = true): Promise<Command[]> {
        // exports = {opts: {}, handler: () => any}
        if (isCommand(module)) {
            return [module];
        }

        // exports = {opts: {}, commands: []}
        if (module.commands) {
            return await flatten(module);
        }

        let commands: Command[] = [];
        if (base) {
            for (let key in module) {
                const value = module[key];
                commands = commands.concat(await parse(value, false));
            }
        }
        
        return commands;
    }

    /**
     * Parses a directory and all of it's sub-directories for commands.
     * 
     * @param dir the path to the directory
     */
    export async function loadDirectory(dir: string): Promise<Command[]> {
        let contents = await fs.readdir(dir), commands: Command[] = [];

        for (let content of contents) {
            const location = path.resolve(dir, content);
            const stat = await fs.stat(location);

            // commands must be .js files
            if (stat.isFile() && !location.endsWith(".js")) continue;

            commands = commands.concat(stat.isDirectory() ? await loadDirectory(location) : await parse(require(location)));
        }

        return commands;
    }

    export async function prependMiddleware(commands: Command[], ...middleware: CommandHandler[]): Promise<void> {
        for (let command of commands) {
            (command.opts.guards || (command.opts.guards = [])).unshift(...middleware);
        }
    }

    export function executeMiddleware(message: Message, middleware: CommandHandler[]): Promise<void> {
        return new Promise((resolve, reject) => {
            let idx = -1;
            const next = (err?: any) => {
                if (err) {
                    return reject(err);
                }
                idx++;
                if (!middleware[idx]) return resolve();
                middleware[idx](message, next);
            };
            next();
        });
    }
}

export const specializeEmbed = (embed: RichEmbed | RichEmbedOptions) => {
    if (embed instanceof RichEmbed) embed.setFooter(BOT_AUTHOR, BOT_ICON);
    else embed.footer = {text: BOT_AUTHOR, icon_url: BOT_ICON};
    return embed;
};