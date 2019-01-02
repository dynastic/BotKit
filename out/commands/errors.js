"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Constants_1 = __importDefault(require("../Constants"));
const util_1 = require("./util");
/**
 * An error class that can be thrown by commands and guards which are rendered to the client
 */
class CommandError {
    constructor(options) {
        this.options = options;
        options.title = options.title || "Something went wrong";
        if (options.errorPrefix !== false) {
            options.message = `${Constants_1.default.ERROR_PREFIX} ${options.message}`;
        }
    }
    /**
     * An embed render of the error
     */
    get embed() {
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle(this.options.title);
        embed.setDescription(this.options.message);
        embed.setColor(Constants_1.default.COLORS.DANGER);
        util_1.CommandUtils.specializeEmbed(embed);
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
    get text() {
        let message = `**${this.options.title}**\n${this.options.message}`;
        if (this.options.code || this.options.tracking) {
            message += `\n*`;
            if (this.options.code)
                message += `${this.options.code}`;
            if (this.options.code && this.options.tracking)
                message += " | ";
            if (this.options.tracking)
                message += `Error ID: ${this.options.tracking}`;
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
    get render() {
        return (this.options.render || Constants_1.default.ERROR_RENDER_FORMAT) === Constants_1.default.ErrorFormat.EMBED ? this.embed : this.text;
    }
    static get FORBIDDEN() {
        return new CommandError({
            message: `You do not have the necessary permissions to do that.`,
            title: "Missing access"
        });
    }
    static GENERIC({ tracking, code }) {
        return new CommandError({
            message: `An error occurred while processing your request. Please try again later.`,
            tracking,
            code
        });
    }
    static NOT_FOUND(message) {
        return new CommandError({
            title: "Not Found",
            message
        });
    }
    static BOT_MISSING_PERMISSIONS({ tracking, permissions }) {
        return new CommandError({
            message: `I can't do that right now because I'm missing ${permissions ? `the following permissions: \n - ${permissions.join('\n - ')}` : 'the necessary permissions'}`,
            title: "Missing permissions",
            tracking
        });
    }
}
exports.CommandError = CommandError;
//# sourceMappingURL=errors.js.map