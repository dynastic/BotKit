import { Collection, Message, MessageEditOptions, MessageMentions, MessageOptions, RichEmbed, RichEmbedOptions, User } from "discord.js";
import fs from "fs-extra";
import path from "path";
import Constants from "../Constants";
import "./api";
import { CommandError } from "./errors";
import { Argumented, ArgumentSDK, ArgumentType } from "./guards/arguments";


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
         * Render a command error
         * @param error error to render
         */
        renderError(error: CommandError): Promise<void>;
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
        args: ArgumentType[];
        /**
         * The command being executd by this message
         */
        command: Command;
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
        /**
         * Whether the command sender has permission to execute this command
         */
        hasPermission: boolean;
        /**
         * Whether the command has been errored
         */
        errored: boolean;
        /**
         * Initial data passed to setup()
         */
        __data: any;
        /**
         * Initialize the message object
         * @param data the data
         * @private
         */
        setup(data: any);
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
        node?: string;
        enabled?: boolean;
        aliases?: string[];
        /**
         * Storage for guards and command states
         */
        data?: {[key: string]: any};
        usage?: {
            description?: string;
            args?: Array<ArgumentSDK.Argument | undefined>;
        }
    } & CommandOptions;
    handler: CommandHandler;
}

export class CommandBuilder {
    private command: Partial<Command> = {};

    public name(name: string) {
        this.opts.name = name;
        return this;
    }

    public enabled(enabled: boolean) {
        this.opts.enabled = enabled;
        return this;
    }

    public alias(alias: string | string[]) {
        this.opts.aliases = (this.opts.aliases || (this.opts.aliases = [])).concat(alias);
        return this;
    }

    public data(key: string, value: any) {
        (this.opts.data || (this.opts.data = {}))[key] = value;
        return this;
    }

    public access(access: AccessLevel) {
        this.opts.access = access;
        return this;
    }

    public guard(guard: CommandHandler | CommandHandler[]) {
        this.opts.guards = (this.opts.guards || (this.opts.guards = [])).concat(guard);
    }

    public category(category: string) {
        this.opts.category = category;
    }

    public handler(handler: CommandHandler) {
        this.command.handler = handler;
    }

    private get opts(): {name?: string, enabled?: boolean, aliases?: string[], data?: {[key: string]: any}} & CommandOptions {
        return this.command.opts || (this.command.opts = {} as any);
    }

    public get built(): Command {
        return this.command as any;
    }
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
            if (access && !command.opts.access) {
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

    export async function preloadMetadata(commands: Command[]): Promise<void> {
        commands.forEach(command => {
            if (command.opts.usage) {
                (command.opts.guards || (command.opts.guards = [])).unshift(Argumented(command));
            }
        });
    }

    /**
     * Parses a directory and all of it's sub-directories for commands.
     * 
     * @param dir the path to the directory
     */
    export async function loadDirectory(dir: string, automaticCategoryNames?: boolean): Promise<Command[]> {
        let contents = await fs.readdir(dir), commands: Command[] = [];

        for (let content of contents) {
            const location = path.resolve(dir, content);
            const stat = await fs.stat(location);

            // commands must be .js files
            if (stat.isFile() && !location.endsWith(".js")) continue;

            const newCommands = stat.isDirectory() ? await loadDirectory(location) : await parse(require(location));

            if (automaticCategoryNames) {
                let parentDirName: string | string[] = path.dirname(location).split('/');
                parentDirName = parentDirName[parentDirName.length - 1];
                for (let command of newCommands) {
                    if (!!command.opts.category) continue;
                    command.opts.category = parentDirName;
                }
            }

            commands = commands.concat(newCommands);
        }

        return commands;
    }

    /**
     * Adds middleware which take priority over existing middleware to commands
     * @param commands commands to add middleware to
     * @param middleware middleware to add
     */
    export async function prependMiddleware(commands: Command[], ...middleware: CommandHandler[]): Promise<void> {
        for (let command of commands) {
            (command.opts.guards || (command.opts.guards = [])).unshift(...middleware);
        }
    }

    /**
     * Executes all middleware on a commmand, resolves when done
     * @param message 
     * @param middleware 
     * @returns whether this was successful
     */
    export function executeMiddleware(message: Message, middleware: CommandHandler[]): Promise<void> {
        return new Promise((resolve, reject) => {
            let idx = -1;
            const next = async (err?: any) => {
                if (err) {
                    // send error down the chain
                    return reject(err);
                }
                idx++;
                if (!middleware[idx]) return resolve();
                // allows guards to throw CommandErrors and sends it down the chain
                try {
                    await middleware[idx](message, next);
                } catch (e) {
                    return reject(e);
                }
            };
            next();
        });
    }

    /**
     * Adds bot branding to an embed
     * @param embed embed to brand
     */
    export const specializeEmbed = (embed: RichEmbed | RichEmbedOptions) => {
        if (embed instanceof RichEmbed) embed.setFooter(Constants.BOT_AUTHOR, Constants.BOT_ICON);
        else embed.footer = {text: Constants.BOT_AUTHOR, icon_url: Constants.BOT_ICON};
        return embed;
    };

    export interface CommandResult {
        deleted?: boolean;
        reply?: [string | MessageOptions | undefined, MessageOptions | undefined];
        edit?: [string, MessageEditOptions | RichEmbed | undefined];
        pinned?: boolean;
        unpinned?: boolean;
        completed?: boolean;
        warning?: boolean;
        error?: CommandError;
    }
    
    export async function runCommand(baseMessage: Message, command: string, user?: User) {
        const actionLog: CommandResult[] = [];
    
        user = user || baseMessage.author;
    
        const trackAction: (result: CommandResult) => Message = result => {
            actionLog.push(result);
            return baseMessage;
        }
    
        command = `${Constants.COMMAND_PREFIX}${command}`;
    
        baseMessage = new Message(baseMessage.channel, { ...baseMessage.__data, author: user}, baseMessage.client);
    
        baseMessage.id = null as any;
        baseMessage.content = command;
        baseMessage.pinned = false;
        baseMessage.tts = false;
        baseMessage.embeds = [];
        baseMessage.attachments = new Collection();
        baseMessage.createdTimestamp = new Date().getTime();
        baseMessage.editedTimestamp = null as any;
        baseMessage.reactions = new Collection();
        baseMessage.mentions = new (MessageMentions as any)(baseMessage);
        baseMessage.webhookID = null as any;
    
        baseMessage.delete = async () => trackAction({deleted: true});
        baseMessage.reply = async (...args: any[]) => trackAction({reply: args as any});
        baseMessage.edit = async (...args: any[]) => trackAction({edit: args as any});
        baseMessage.pin = async () => trackAction({pinned: true});
        baseMessage.unpin = async () => trackAction({unpinned: true});
        baseMessage.complete = baseMessage.success = baseMessage.done = async () => trackAction({completed: true}) as any;
        baseMessage.warning = baseMessage.danger = baseMessage.caution = async () => trackAction({warning: true}) as any;
        baseMessage.renderError = async error => trackAction({error}) as any;
    
        await baseMessage.client.botkit.commandSystem.messageIntake(baseMessage);
    
        return actionLog.reduce((obj, c) => {
            Object.keys(c).forEach(key => obj[key] = c[key]);
            return obj;
        }, {});
    }
}