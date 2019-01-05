import { Message } from "discord.js";
import Application from "..";
import * as CommandUtil from "./util";
export interface CommandSystemOptions {
    directory?: string;
    preloadExclude?: string[];
    automaticCategoryNames?: boolean;
    app: Application;
    globalGuards?: CommandUtil.CommandHandler[];
    /**
     * Hooks for various BotKit events
     */
    hooks?: {
        /**
         * Called before BotKit begins processing a message.
         */
        preMessageHandling?: (message: Message) => Promise<void>;
    };
}
export interface CommandMetadata {
    [command: string]: {
        syntax: string | undefined;
        description: string | undefined;
    } | undefined;
}
/**
 * A system which loads and tracks commands
 */
export default class CommandSystem {
    private options;
    commands: {
        [key: string]: CommandUtil.Command | undefined;
    };
    /**
     * Guards to run on all commands
     */
    private readonly globalGuards;
    constructor(options: CommandSystemOptions);
    messageIntake(message: Message): Promise<void>;
    /**
     * Loads commands into the tracking system
     */
    init(): Promise<void>;
    loadCommands(commands: CommandUtil.Command[] | CommandUtil.Commands): Promise<void>;
    /**
     * Executes the command initiated by the message
     * @param message the message initiating a command
     */
    executeCommand(message: Message): Promise<void>;
}
export * from "./api";
export * from "./errors";
export * from "./guards";
export * from "./permissions";
export * from "./util";
