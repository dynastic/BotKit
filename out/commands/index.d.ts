import { Message } from "discord.js";
import * as CommandUtil from "./util";
import Application from "..";
import * as Guards from "./guards";
export interface CommandSystemOptions {
    directory?: string;
    app: Application;
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
     * Command metadata, for help etc.
     */
    metadata: CommandMetadata;
    /**
     * Guards to run on all commands
     */
    private readonly globalGuards;
    constructor(options: CommandSystemOptions);
    /**
     * Loads commands into the tracking system
     */
    init(): Promise<void>;
    /**
     * Executes the command initiated by the message
     * @param message the message initiating a command
     */
    executeCommand(message: Message): Promise<void>;
}
export * from "./util";
export { Guards };
export * from "./errors";
export * from "./api";
