import {Message} from "discord.js";

import * as CommandUtil from "./util";
import { COMMAND_PREFIX, ARGUMENT_REGEX, SUCCESS_EMOJI, FAIL_EMOJI, WARNING_EMOJI } from "../Constants";
import path from "path";
import {CommandError} from "./errors";
import Application, { RoleOptions } from "..";
import { PermissionGuard } from "./guards";

import * as Guards from "./guards";

export interface CommandSystemOptions {
    directory?: string;
    app: Application;
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

/**
 * A system which loads and tracks commands
 */
export default class CommandSystem {
    public commands: {[key: string]: CommandUtil.Command | undefined} = {};
    /**
     * Command metadata, for help etc.
     */
    public metadata: CommandMetadata = {};
    
    /**
     * Guards to run on all commands
     */
    private readonly globalGuards: CommandUtil.CommandHandler[] = [];

    public constructor(private options: CommandSystemOptions) {
        this.globalGuards = [];
        options.app.client.on("message", message => {
            if (typeof message.isCommand === "undefined") {
                message.isCommand = message.content.startsWith(COMMAND_PREFIX);
            }
        
            if (!message.args && message.isCommand) {
                message.args = message.content.substring(COMMAND_PREFIX.length).trim().match(ARGUMENT_REGEX) as string[];
                for (let i = 0; i < message.args.length; i++) {
                    message.args[i] = stripStartEnd('"', message.args[i]);
                    message.args[i] = stripStartEnd("'", message.args[i]);
                }
            }
        
            if (!message.command && message.isCommand) {
                message.command = options.app.commandSystem.commands[message.args[0]]!;
                message.args.shift();
            }
        });
    }

    /**
     * Loads commands into the tracking system
     */
    public async init(): Promise<void> {
        let commands = this.options.directory ? await CommandUtil.CommandUtils.loadDirectory(this.options.directory) : [];
        commands = commands.concat(await CommandUtil.CommandUtils.parse(require(path.resolve(__dirname, "commands"))));
        await CommandUtil.CommandUtils.prependMiddleware(commands, PermissionGuard);

        for (let command of commands) {
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
            if (!message.reject) message.reject = (err = CommandError.GENERIC({})) => {
                const render = err.render;
                return message.reply(typeof render === "string" ? render : "", {embed: typeof render === "object" ? render : undefined}) as any as Promise<void>
            };
            if (error instanceof CommandError) {
                return await message.reject(error);
            }
            /**
             * @todo tracking
             */
            console.error(error);
            await message.reject(CommandError.GENERIC({}));
        };
        try {
            await CommandUtil.CommandUtils.executeMiddleware(message, this.globalGuards);
        } catch (e) {
            return await sendError(e);
        }
        const command = message.command;
        if (!command || command.opts.enabled === false) {
            await message.reject(new CommandError({
                message: `That command doesn't exist! Try \`${COMMAND_PREFIX}help\` for a list of commands.`,
                title: "Unknown command"
            }));
            return;
        }
        try {
            if (command.opts.guards) {
                await CommandUtil.CommandUtils.executeMiddleware(message, command.opts.guards);
            }
            await command.handler(message, sendError);
        } catch (e) {
            return await sendError(e);
        }
    }
}

export * from "./util";
export { Guards }
export * from "./errors";
export * from "./api";