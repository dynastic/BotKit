"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Constants_1 = require("../Constants");
const util_1 = require("./util");
exports.ERROR_PREFIX = "**Uh oh!**";
class CommandError {
    constructor(options) {
        this.options = options;
        options.title = options.title || "Something went wrong";
        if (options.errorPrefix !== false) {
            options.message = `${exports.ERROR_PREFIX} ${options.message}`;
        }
    }
    get embed() {
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle(this.options.title);
        embed.setDescription(this.options.message);
        embed.setColor(Constants_1.COLORS.DANGER);
        util_1.specializeEmbed(embed);
        if (this.options.code || this.options.tracking) {
            embed.setAuthor(`${this.options.code ? `${this.options.code} | ` : ''}${this.options.tracking ? `Error ID: ${this.options.tracking}` : ''}`);
        }
        return embed;
    }
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
        return message;
    }
    get render() {
        return (this.options.render || Constants_1.ERROR_RENDER_FORMAT) === Constants_1.ErrorFormat.EMBED ? this.embed : this.text;
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