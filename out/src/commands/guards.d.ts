import { CommandHandler } from './util';
/**
 * Simple guard which ensures a user has a given access level
 * @param msg the message to check against
 * @param next next function
 */
export declare const PermissionGuard: CommandHandler;
export * from "./guards/index";
