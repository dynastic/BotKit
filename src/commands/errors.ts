import { RichEmbed } from "discord.js";
import Constants from "../Constants";
import { CommandUtils } from "./util";

export interface CommandErrorOptions {
    message: string;
    title?: string;
    code?: string;
    tracking?: string;
    errorPrefix?: boolean;
    render?: Constants.ErrorFormat;
    fields?: {
        [key: string]: string;
    };
}

/**
 * An error class that can be thrown by commands and guards which are rendered to the client
 */
export class CommandError {
    public constructor(private options: CommandErrorOptions) {
        options.title = options.title || "Something went wrong";
        if (options.errorPrefix !== false) {
            options.message = `${Constants.ERROR_PREFIX} ${options.message}`;
        }
    }

    /**
     * An embed render of the error
     */
    public get embed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setTitle(this.options.title);
        embed.setDescription(this.options.message);
        embed.setColor(Constants.COLORS.DANGER);
        CommandUtils.specializeEmbed(embed);
        if (this.options.code || this.options.tracking) {
            embed.setAuthor(`${this.options.code ? `${this.options.code} | ` : ''}${this.options.tracking ? `Error ID: ${this.options.tracking}` : ''}`);
        }
        if (this.options.fields) {
            for (let field in this.options.fields) {
                embed.addField(field, this.options.fields[field], true);
            }
        }
        return embed;
    }

    /**
     * A plaintext render of the error
     */
    public get text(): string {
        let message = `**${this.options.title}**\n${this.options.message}`;
        if (this.options.code || this.options.tracking) {
            message += `\n*`;
            if (this.options.code) message += `${this.options.code}`;
            if (this.options.code && this.options.tracking) message += " | ";
            if (this.options.tracking) message += `Error ID: ${this.options.tracking}`;
        }
        if (this.options.fields) {
            message += "```";
            
            for (let field in this.options.fields) {
                const fieldText = this.options.fields[field];
                message += `\n${field}\n${''.padStart(field.length, '-')}\n${fieldText}`;
            }

            message += "\n```";
        }
        return message;
    }

    /**
     * Determines which render to return based on the options or constant
     */
    public get render(): string | RichEmbed {
        return (this.options.render || Constants.ERROR_RENDER_FORMAT) === Constants.ErrorFormat.EMBED ? this.embed : this.text;
    }

    public static get FORBIDDEN(): CommandError {
        return new CommandError({
            message: `You do not have the necessary permissions to do that.`,
            title: "Missing access"
        });
    }

    public static GENERIC({tracking, code}: {tracking?: string, code?: string}): CommandError {
        return new CommandError({
            message: `An error occurred while processing your request. Please try again later.`,
            tracking,
            code
        });
    }

    public static NOT_FOUND(message: string): CommandError {
        return new CommandError({
            title: "Not Found",
            message
        });
    }

    public static BOT_MISSING_PERMISSIONS({tracking, permissions}: {tracking?: string, permissions?: string[]}): CommandError {
        return new CommandError({
            message: `I can't do that right now because I'm missing ${permissions ? `the following permissions: \n - ${permissions.join('\n - ')}` : 'the necessary permissions'}`,
            title: "Missing permissions",
            tracking
        });
    }
}