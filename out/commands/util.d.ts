import { Message, MessageEditOptions, MessageOptions, RichEmbed, RichEmbedOptions, User } from "discord.js";
import "./api";
import { CommandError } from "./errors";
import { ArgumentSDK, ArgumentType } from "./guards/internal/arguments";
import { Environment } from "./guards/internal/environment";
import { ExtraPermissionString } from "./guards/internal/bot-permisisons";
import Application from "..";
import { PermissionSetEntityStub } from "./permissions";
declare module 'discord.js' {
    interface Client {
        botkit: Application<PermissionSetEntityStub>;
    }
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
        setup(data: any): any;
        /**
         * The command prefix for this message.
         */
        commandPrefix: string;
        /**
         * Metrics object with various timings
         */
        metrics: Metrics;
    }
}
export interface Metrics {
    /**
     * time the execution began
     */
    start: number;
    /**
     * time the preprocessing execution stopped
     * start is start
     */
    finishedPreprocessingTime: number;
    /**
     * time the guard/middleware processing completed
     * start is finished preprocessing
     */
    finishedGuardProcessingTime: number;
    /**
     * time the execution has stopped
     * start is start
     *
     * (this is generally unavailable as there is not much left running at end of execution)
     */
    finishedExecutionTime: number;
    [key: string]: number;
}
export interface CommandHandler {
    (message: Message, next: (err?: any) => any): any;
}
export interface CommandOptions {
    guards?: CommandHandler[];
    category?: string;
    environments?: Environment[];
    botPermissions?: ExtraPermissionString[];
    node?: string;
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
        usage?: {
            description?: string;
            args?: Array<ArgumentSDK.Argument | undefined>;
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
    function preloadMetadata(commands: Command[]): Promise<void>;
    /**
     * Parses a directory and all of it's sub-directories for commands.
     *
     * @param dir the path to the directory
     */
    function loadDirectory(dir: string, automaticCategoryNames?: boolean): Promise<Command[]>;
    /**
     * Adds middleware which take priority over existing middleware to commands
     * @param commands commands to add middleware to
     * @param middleware middleware to add
     */
    function prependMiddleware(commands: Command[], ...middleware: CommandHandler[]): Promise<void>;
    /**
     * Executes all middleware on a commmand, resolves when done
     * @param message
     * @param middleware
     * @returns whether this was successful
     */
    function executeMiddleware(message: Message, middleware: CommandHandler[]): Promise<void>;
    /**
     * Adds bot branding to an embed
     * @param embed embed to brand
     */
    const specializeEmbed: (embed: RichEmbed | RichEmbedOptions) => RichEmbed | RichEmbedOptions;
    interface CommandResult {
        deleted?: boolean;
        reply?: [string | MessageOptions | undefined, MessageOptions | undefined];
        edit?: [string, MessageEditOptions | RichEmbed | undefined];
        pinned?: boolean;
        unpinned?: boolean;
        completed?: boolean;
        warning?: boolean;
        error?: CommandError;
    }
    function runCommand(baseMessage: Message, command: string, user?: User): Promise<CommandResult>;
}
