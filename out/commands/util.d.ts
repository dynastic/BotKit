import "./api";
import { Message, RichEmbed, RichEmbedOptions } from "discord.js";
import { CommandError } from "./errors";
import Application from "..";
export declare enum AccessLevel {
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
        data?: {
            [key: string]: any;
        };
    } & CommandOptions;
    handler: CommandHandler;
}
export interface Commands {
    opts?: CommandOptions;
    commands: Array<Command | Commands>;
}
export declare namespace CommandUtils {
    function isCommandOptions(options: any): options is CommandOptions;
    function isCommand(command: any): command is Command;
    function isCommands(commands: any): commands is Commands;
    /**
     * Flattens a commands object into a command array
     *
     * @param param0 the commands to flatten
     */
    function flatten({ opts, commands }: Commands): Promise<Command[]>;
    /**
     * Parses a POJSO and converts it to an array of commands
     *
     * @param module the plain object to parse
     */
    function parse(module: any, base?: boolean): Promise<Command[]>;
    /**
     * Parses a directory and all of it's sub-directories for commands.
     *
     * @param dir the path to the directory
     */
    function loadDirectory(dir: string): Promise<Command[]>;
    function prependMiddleware(commands: Command[], ...middleware: CommandHandler[]): Promise<void>;
    function executeMiddleware(message: Message, middleware: CommandHandler[]): Promise<void>;
    const specializeEmbed: (embed: RichEmbed | RichEmbedOptions) => RichEmbed | RichEmbedOptions;
}
