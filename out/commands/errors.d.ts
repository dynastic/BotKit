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
/**
 * An error class that can be thrown by commands and guards which are rendered to the client
 */
export declare class CommandError {
    private options;
    constructor(options: CommandErrorOptions);
    /**
     * An embed render of the error
     */
    readonly embed: RichEmbed;
    /**
     * A plaintext render of the error
     */
    readonly text: string;
    /**
     * Determines which render to return based on the options or constant
     */
    readonly render: string | RichEmbed;
    static readonly FORBIDDEN: CommandError;
    static GENERIC({ tracking, code }: {
        tracking?: string;
        code?: string;
    }): CommandError;
    static BOT_MISSING_PERMISSIONS({ tracking, permissions }: {
        tracking?: string;
        permissions?: string[];
    }): CommandError;
}
