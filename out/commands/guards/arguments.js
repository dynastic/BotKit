"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Constants_1 = require("../../Constants");
var ArgumentSDK;
(function (ArgumentSDK) {
    /**
     * Checks the type of a given value
     * @param value the value to check
     * @param type the typeof to validate
     * @param error the error to return
     */
    function parse(value, type, error) {
        try {
            value = JSON.parse(value);
            if (typeof value !== type) {
                return { error, value };
            }
            return { error: null, value };
        }
        catch (e) {
            return { error, value };
        }
    }
    ArgumentSDK.parse = parse;
    /**
     * Functions related to extracting IDs from strings
     */
    let Matching;
    (function (Matching) {
        const channelRegex = /(?:<#)(\d{17,19})(?:>)/g;
        const userRegex = /(?:<@!?)(1|\d{17,19})(?:>)/g;
        /**
         * Extracts the channel ID
         * @param str the string to match
         */
        Matching.channel = (str) => {
            channelRegex.lastIndex = 0;
            const match = channelRegex.exec(str);
            return match && match[1];
        };
        /**
         * Extracts the UID
         * @param str the string to match
         */
        Matching.user = (str) => {
            userRegex.lastIndex = 0;
            const match = userRegex.exec(str);
            return match && match[1];
        };
    })(Matching = ArgumentSDK.Matching || (ArgumentSDK.Matching = {}));
})(ArgumentSDK = exports.ArgumentSDK || (exports.ArgumentSDK = {}));
/**
 * Creates an argument parsing guard
 * @param desc The command description
 * @param args The command arguments
 * @param command The command itself
 */
exports.Argumented = (command, description, args) => {
    // every idx of validators array corresponds to args array
    const validators = [];
    let syntax = `${Constants_1.COMMAND_PREFIX}${command}`;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg) {
            // there's no argument data for this, including a name. we use param{idx} as the name
            syntax += ` <param${i}>`;
            validators[i] = null;
            continue;
        }
        const { name, type, unlimited, required } = arg;
        // appends this argument slot to the syntax str
        syntax += ` <${unlimited ? '...' : ''}${name}${required === false ? "?" : ""}>`;
        validators[i] = {
            name,
            validator: async (args, msg) => {
                let text = unlimited ? args[i] = args.slice(i).join(" ") : args[i];
                if (!text || text.length === 0) {
                    if (required !== false) {
                        return "This argument is required.";
                    }
                    return null;
                }
                switch (type) {
                    case "string":
                        // there's really nothing to validate if it's a string, it's already a string.
                        return null;
                    // boolean and number are identical in how they're parsed, so they're the same handling code
                    case "boolean":
                    case "number":
                        const result = ArgumentSDK.parse(args[i], type, `Must be a ${type}.`);
                        args[i] = result.value;
                        return result.error;
                    case "user":
                    case "member":
                        let userID = ArgumentSDK.Matching.user(text);
                        args[i] = userID && (type === "member" ? msg.guild.members : msg.client.users).get(userID);
                        return args[i] ? null : `Must be a ${type}`;
                    case "guild":
                        args[i] = msg.client.guilds.get(text);
                        return args[i] ? null : `Must be a ${type}`;
                    case "channel":
                        let channelID = ArgumentSDK.Matching.channel(text);
                        args[i] = channelID && msg.client.channels.get(channelID);
                        return args[i] ? null : `Must be a ${type}`;
                    case "message":
                        return (args[i] = await msg.channel.fetchMessage(text)) ? null : `Must be a ${type}`;
                    default:
                        return await type(args, msg);
                }
            }
        };
    }
    return async (message, next) => {
        // every idx of the issues array corresponds to idx of args array
        // sets the command metadata for the help command
        if (!message.client.botkit.commandSystem.metadata[command]) {
            message.client.botkit.commandSystem.metadata[command] = { syntax, description };
        }
        const issues = [];
        let error = false;
        for (let i = 0; i < validators.length; i++) {
            const validator = validators[i];
            if (!validator) {
                issues[i] = null;
                continue;
            }
            error = error ? true : !!(issues[i] = await validator.validator(message.args, message));
        }
        // there's no errors, so we call next and continue the command flow
        if (!error)
            return next();
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle(`Syntax errors for ${command}`);
        embed.addField("Syntax", `\`${syntax}\``);
        for (let i = 0; i < issues.length; i++) {
            const validator = validators[i];
            // again, we use a placeholder name if there's no validator. this is unlikely to happen though. just satisfies tsc.
            const name = validator ? validator.name : `param${i}`;
            const issue = issues[i];
            // we include the type so we can hint to the user what exactly must be provided,
            // just in case the error message is vague.
            let type = args[i] && ` (type: ${args[i].type})`;
            if (typeof type !== "string")
                type = "";
            embed.addField(name, issue ? `${Constants_1.WARNING_EMOJI} ${issue}${type}` : `${Constants_1.SUCCESS_EMOJI}${type}`, true);
        }
        await Promise.all([message.reply(embed), message.warning()]);
    };
};
//# sourceMappingURL=arguments.js.map