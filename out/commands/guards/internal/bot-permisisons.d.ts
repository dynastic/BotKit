import { PermissionString } from "discord.js";
import { CommandHandler } from "../../util";
export declare type ExtraPermissionString = PermissionString | "OWNER";
export declare const BotPermissions: (...perms: ExtraPermissionString[]) => CommandHandler;
