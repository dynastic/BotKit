import { Client } from "discord.js";
import CommandSystem, { PermissionSetEntityStub } from "./commands";
import { Context } from "./commands/commands";
import BKConstants from "./Constants";
import "./node-additions";
import "./override";
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
    COMMAND_PREFIX?: string;
    /**
     * whether to render errors in plaintext or embeds
     */
    ERROR_RENDER_FORMAT?: BKConstants.ErrorFormat;
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
    contextPopulator?: (context: Context) => Context;
    /**
     * The permissions entity that BotKit should query to determine command accessibility
     */
    permissionsEntity?: T;
    /**
     * The reference to the superusers on this instance
     */
    superuserCheck?: (id: string) => boolean;
    /**
     * Advanced overrides. Do not modify things without knowing what they do.
     */
    overrides?: {
        commandSystem?: {
            features?: {
                nodeBasedPermissions?: false;
                superuserPermissions?: false;
            };
        };
    };
}
/**
 * Initializes the framework
 */
export declare class Application<T extends PermissionSetEntityStub = PermissionSetEntityStub> {
    options: ApplicationOptions<T>;
    readonly client: Client;
    readonly commandSystem: CommandSystem;
    constructor(options: ApplicationOptions<T>);
    /**
     * Sets the Discord client up and loads the command system
     */
    init(): Promise<void>;
}
export default Application;
export * from "./commands";
export declare const Constants: typeof BKConstants;
export * from "./db";
export * from "./modules";
export * from "./util";
