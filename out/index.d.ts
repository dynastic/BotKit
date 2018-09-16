import { Client } from "discord.js";
import * as Constants from "./Constants";
import CommandSystem from "./commands";
export interface RoleOptions {
    moderator: string[];
    admin: string[];
    root: string[];
}
export interface ApplicationOptions {
    token: string;
    commandDirectory: string;
    commandPrefix?: string;
    errorFormat?: Constants.ErrorFormat;
    roles: RoleOptions;
}
export declare class Application {
    private options;
    readonly client: Client;
    readonly commandSystem: CommandSystem;
    data: {
        [key: string]: any;
    };
    constructor(options: ApplicationOptions);
    init(): Promise<void>;
}
export default Application;
export import Constants = require("./Constants");
export * from "./util";
export * from "./db";
export * from "./commands";
