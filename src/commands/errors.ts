import {RichEmbed} from "discord.js";
import { COLORS, DYNASTIC_ICON, ERROR_RENDER_FORMAT, ErrorFormat } from "../Constants";
import { specializeEmbed } from "./util";

export interface CommandErrorOptions {
    message: string;
    title?: string;
    code?: string;
    tracking?: string;
    errorPrefix?: boolean;
    render?: ErrorFormat;
}

export const ERROR_PREFIX = "**Uh oh!**";

export class CommandError {
    public constructor(private options: CommandErrorOptions) {
        options.title = options.title || "Something went wrong";
        if (options.errorPrefix !== false) {
            options.message = `${ERROR_PREFIX} ${options.message}`;
        }
    }

    public get embed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setTitle(this.options.title);
        embed.setDescription(this.options.message);
        embed.setColor(COLORS.DANGER);
        specializeEmbed(embed);
        if (this.options.code || this.options.tracking) {
            embed.setAuthor(`${this.options.code ? `${this.options.code} | ` : ''}${this.options.tracking ? `Error ID: ${this.options.tracking}` : ''}`);
        }
        return embed;
    }

    public get text(): string {
        let message = `**${this.options.title}**\n${this.options.message}`;
        if (this.options.code || this.options.tracking) {
            message += `\n*`;
            if (this.options.code) message += `${this.options.code}`;
            if (this.options.code && this.options.tracking) message += " | ";
            if (this.options.tracking) message += `Error ID: ${this.options.tracking}`;
        }
        return message;
    }

    public get render(): string | RichEmbed {
        return (this.options.render || ERROR_RENDER_FORMAT) === ErrorFormat.EMBED ? this.embed : this.text;
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

    public static BOT_MISSING_PERMISSIONS({tracking, permissions}: {tracking?: string, permissions?: string[]}): CommandError {
        return new CommandError({
            message: `I can't do that right now because I'm missing ${permissions ? `the following permissions: \n - ${permissions.join('\n - ')}` : 'the necessary permissions'}`,
            title: "Missing permissions",
            tracking
        });
    }
}