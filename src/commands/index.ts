import { Message } from "discord.js";
import path from "path";
import Application from "..";
import Constants from "../Constants";
import { CommandError } from "./errors";
import { PermissionsGuard } from "./guards/permissions";
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
        preMessageHandling?: (message: Message) => Promise<void>
    }
}

const stripStartEnd = (token: string, str: string) => {
    if (str.startsWith(token) && str.endsWith(token)) str = str.substring(token.length, str.length - token.length);
    return str;
}

export interface CommandMetadata {
    [command: string]: {
        syntax: string | undefined;
        description: string | undefined;
    } | undefined;
}

const COMMAND_NAME_REGEX = /^[a-z0-9\-]+$/i;

/**
 * A system which loads and tracks commands
 */
export default class CommandSystem {
    public commands: { [key: string]: CommandUtil.Command | undefined } = {};

    /**
     * Guards to run on all commands
     */
    private readonly globalGuards: CommandUtil.CommandHandler[] = [];

    public constructor(private options: CommandSystemOptions) {
        this.globalGuards = [PermissionsGuard].concat(options.globalGuards || []);

        options.app.client.on("message", message => this.messageIntake(message));
    }

    public async messageIntake(message: Message) {
        if (this.options.hooks && this.options.hooks.preMessageHandling) await this.options.hooks.preMessageHandling(message);
        message.commandPrefix = message.commandPrefix || Constants.COMMAND_PREFIX;
        if (typeof message.isCommand === "undefined") {
            message.isCommand = message.content.startsWith(message.commandPrefix);
        }

        if (!message.isCommand) return;

        if (!message.args) {
            message.args = message.content.substring(message.commandPrefix.length).trim().match(Constants.ARGUMENT_REGEX) as string[] || [];
            for (let i = 0; i < message.args.length; i++) {
                message.args[i] = stripStartEnd('"', message.args[i] as string);
                message.args[i] = stripStartEnd("'", message.args[i] as string);
            }
        }

        if (message.args.length === 0) return;

        const [commandName] = message.args as string[];

        // Do not recognize non-alphanum command names.
        if (!commandName.match(COMMAND_NAME_REGEX)) {
            return;
        }

        if (!message.command) {
            message.command = this.options.app.commandSystem.commands[commandName]!;
            message.args.shift();
        }

        message.metrics.finishedPreprocessingTime = Date.now();

        await this.executeCommand(message);
    }
    /**
     * Loads commands into the tracking system
     */
    public async init(): Promise<void> {
        let commands = this.options.directory ? await CommandUtil.CommandUtils.loadDirectory(this.options.directory, this.options.automaticCategoryNames) : [];
        commands = commands.concat(await CommandUtil.CommandUtils.parse(require(path.resolve(__dirname, "commands"))));
        await this.loadCommands(commands);
    }

    public async loadCommands(commands: CommandUtil.Command[] | CommandUtil.Commands): Promise<void> {
        if (!Array.isArray(commands)) {
            commands = await CommandUtil.CommandUtils.flatten(commands);
        }

        await CommandUtil.CommandUtils.preloadMetadata(commands);

        for (let command of commands) {
            if (this.options.preloadExclude && this.options.preloadExclude.includes(command.opts.name)) continue;
            this.commands[command.opts.name] = command;
            if (command.opts.aliases) {
                for (let alias of command.opts.aliases) {
                    this.commands[alias] = command;
                }
            }
        }
    }

    /**
     * Executes the command initiated by the message
     * @param message the message initiating a command
     */
    public async executeCommand(message: Message): Promise<void> {
        const sendError = async (error: any) => {
            if (!error) return;
            if (error instanceof CommandError) {
                return await message.renderError(error);
            }
            /**
             * @todo tracking
             */
            console.error(error);
            await message.renderError(CommandError.GENERIC({}));
        };
        const command = message.command;
        if (!command || command.opts.enabled === false) {
            await message.renderError(new CommandError({
                message: `That command doesn't exist! Try \`${message.commandPrefix}help\` for a list of commands.`,
                title: "Unknown command"
            }));
            return;
        }
        try {
            await CommandUtil.CommandUtils.executeMiddleware(message, this.globalGuards.concat(command.opts.guards || []));
            message.metrics.finishedGuardProcessingTime = Date.now();
            if (message.errored) return;
            await command.handler(message, sendError);
        } catch (e) {
            return await sendError(e);
        }
    }
}

export * from "./api";
export * from "./errors";
export * from "./guards";
export * from "./permissions";
export * from "./util";
