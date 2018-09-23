import { Client } from "discord.js";
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
}
/**
 * Initializes the framework
 */
export declare class Application {
    private options;
    readonly client: Client;
    readonly commandSystem: CommandSystem;
    constructor(options: ApplicationOptions);
    /**
     * Sets the Discord client up and loads the command system
     */
    init(): Promise<void>;
}
export default Application;
export import Constants = require("./Constants");
export * from "./util";
export * from "./db";
export * from "./commands";
