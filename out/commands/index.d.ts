import { Message } from "discord.js";
import * as CommandUtil from "./util";
import Application, { RoleOptions } from "..";
import * as Guards from "./guards";
export interface CommandSystemOptions {
    directory: string;
    app: Application;
    roles: RoleOptions;
}
export interface CommandMetadata {
    [command: string]: {
        syntax: string | undefined;
        description: string | undefined;
    } | undefined;
}
export default class CommandSystem {
    private options;
    commands: {
        [key: string]: CommandUtil.Command | undefined;
    };
    metadata: CommandMetadata;
    private readonly globalGuards;
    constructor(options: CommandSystemOptions);
    init(): Promise<void>;
    executeCommand(message: Message): Promise<void>;
}
export * from "./util";
export { Guards };
export * from "./errors";
export * from "./api";
