import { RichEmbed } from "discord.js";
import { ErrorFormat } from "../Constants";
export interface CommandErrorOptions {
    message: string;
    title?: string;
    code?: string;
    tracking?: string;
    errorPrefix?: boolean;
    render?: ErrorFormat;
}
export declare const ERROR_PREFIX = "**Uh oh!**";
export declare class CommandError {
    private options;
    constructor(options: CommandErrorOptions);
    readonly embed: RichEmbed;
    readonly text: string;
    readonly render: string | RichEmbed;
    static readonly FORBIDDEN: CommandError;
    static GENERIC({tracking, code}: {
        tracking?: string;
        code?: string;
    }): CommandError;
    static BOT_MISSING_PERMISSIONS({tracking, permissions}: {
        tracking?: string;
        permissions?: string[];
    }): CommandError;
}
