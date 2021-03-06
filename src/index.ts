import { Client, Message } from "discord.js";
import CommandSystem, { PermissionSetEntityStub, CommandHandler } from "./commands";
import { Context } from "./commands/commands";
import BKConstants from "./Constants";
import "./node-additions";


export interface RoleOptions {
    moderator: string[];
    admin: string[];
    root: string[];
}

export interface ApplicationOptions<T extends PermissionSetEntityStub> {
    /**
     * discord token. required unless you pass a client which has already been logged-in
     */
    token?: string;
    /**
     * discord client. if not passed, the application will create one.
     */
    client?: Client;
    /**
     * directory to load command files from
     */
    commandDirectory?: string;
    /**
     * whether or not command categories should default to their parent folder name.
     * default is false
     */
    automaticCategoryNames?: boolean;
    /**
     * message prefix for commands
     */
    commandPrefix?: typeof Constants['COMMAND_PREFIX'];
    /**
     * whether to render errors in plaintext or embeds
     */
    errorFormat?: BKConstants.ErrorFormat;
    /**
     * Commands to exclude from bot loading
     */
    preloadExclude?: string[];
    /**
     * Function that adds additional variables to eval contexts
     */
    contextPopulator?: (context: Context) => Context
    /**
     * The permissions entity that BotKit should query to determine command accessibility
     */
    permissionsEntity?: T;
    /**
     * The reference to the superusers on this instance
     */
    superuserCheck?: (id: string) => boolean;
    /**
     * The global guards to use
     */
    globalGuards?: CommandHandler[];
    /**
     * Advanced overrides. Do not modify things without knowing what they do.
     */
    overrides?: {
        commandSystem?: {
            features?: {
                nodeBasedPermissions?: false;
                superuserPermissions?: false;
            }
        }
    };
    hooks?: CommandSystem["options"]["hooks"];
}

/**
 * Initializes the framework
 */
export class Application<T extends PermissionSetEntityStub = PermissionSetEntityStub> {
    public readonly client: Client;
    public readonly commandSystem: CommandSystem;

    public constructor(public options: ApplicationOptions<T>) {
        BKConstants.applyPatches({
            COMMAND_PREFIX: options.commandPrefix,
            ERROR_RENDER_FORMAT: options.errorFormat
        });
    }

    /**
     * Sets the Discord client up and loads the command system
     */
    public async init(): Promise<void> {
        (this as any).client = this.options.client || new Client();
        this.client.botkit = this;
        if (!this.client.readyTimestamp) {
            await this.client.login(this.options.token);
        }

        (this as any).commandSystem = new CommandSystem({
            directory: this.options.commandDirectory,
            app: this,
            preloadExclude: this.options.preloadExclude,
            automaticCategoryNames: this.options.automaticCategoryNames,
            globalGuards: this.options.globalGuards,
            hooks: this.options.hooks
        });
        await this.commandSystem.init();
    }
}

export default Application;

export * from "./commands";
export const Constants = BKConstants;
export * from "./db";
export * from "./modules";
export * from "./util";
