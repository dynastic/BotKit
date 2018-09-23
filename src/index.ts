import {Client} from "discord.js";
import * as Constants from "./Constants";
import CommandSystem from "./commands";

export interface RoleOptions {
    moderator: string[];
    admin: string[];
    root: string[];
}

export interface ApplicationOptions {
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
    COMMAND_PREFIX?: string;
    /**
     * whether to render errors in plaintext or embeds
     */
    ERROR_RENDER_FORMAT?: Constants.ErrorFormat;
    /**
     * permission roles
     */
    ROLES?: RoleOptions;
    /**
     * Commands to exclude from bot loading
     */
    preloadExclude?: string[];
    /**
     * Function that adds additional variables to eval contexts
     */
    contextPopulator?: (context: Context) => Context
}

/**
 * Initializes the framework
 */
export class Application {
    public readonly client: Client;
    public readonly commandSystem: CommandSystem;

    public constructor(public options: ApplicationOptions) {
        Constants.applyPatches({
            COMMAND_PREFIX: options.COMMAND_PREFIX,
            ERROR_RENDER_FORMAT: options.ERROR_RENDER_FORMAT,
            ROLES: options.ROLES
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

        (this as any).commandSystem = new CommandSystem({directory: this.options.commandDirectory, app: this, preloadExclude: this.options.preloadExclude, automaticCategoryNames: this.options.automaticCategoryNames});
        await this.commandSystem.init();

        this.client.on("message", message => {
            if (!message.cleanContent.startsWith(Constants.COMMAND_PREFIX)) return;
            this.commandSystem.executeCommand(message);
        });
    }
}

export default Application;

export import Constants = require("./Constants");
import { Context } from "./commands/commands";
export * from "./util";
export * from "./db";
export * from "./commands";