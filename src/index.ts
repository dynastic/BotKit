import {Client} from "discord.js";
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

export class Application {
    public readonly client: Client;
    public readonly commandSystem: CommandSystem;

    public data: {[key: string]: any} = {};

    public constructor(private options: ApplicationOptions) {
        Constants.applyPatches(options as any);
    }

    public async init(): Promise<void> {
        (this as any).client = new Client();
        this.client.botkit = this;
        await this.client.login(this.options.token);

        (this as any).commandSystem = new CommandSystem({directory: this.options.commandDirectory, app: this, roles: this.options.roles});
        await this.commandSystem.init();

        this.client.on("message", message => {
            if (!message.cleanContent.startsWith(Constants.COMMAND_PREFIX)) return;
            this.commandSystem.executeCommand(message);
        });
    }
}

export default Application;

export import Constants = require("./Constants");
export * from "./util";
export * from "./db";
export * from "./commands";