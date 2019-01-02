import { Channel, Guild, GuildMember, Message, RichEmbed, Role, User } from "discord.js";
import Constants from "../../Constants";
import { Command, CommandHandler } from "../util";

/**
 * This is not a public guard. This is part of the arguments api.
 * 
 * You may include this guard in a command by using the usage entry on command opts
 * 
 * opts: {
 *  usage: {
 *    description: "Dies",
 *    args: []
 *  }
 * }
 */

export namespace ArgumentSDK {
    /**
     * An argument slot.
     */
    export interface Argument {
        name: string;
        /**
         * If the type is a function, it takes the place of a validator function and returns the error or null.
         */
        type: "string" | "boolean" | "number" | "user" | "member" | "guild" | "channel" | "message" | "role" | Validator;
        unlimited?: boolean;
        required?: boolean;
    }

    export type ArgumentType = string | User | GuildMember | Guild | Channel | Message | Role;

    /**
     * A function that inspects the arguments and returns errors, or null.
     * 
     * The function takes the entire argument array but should inspect only one
     * argument, as each validator function is for a specific argument slot.
     */
    export type Validator = (args: string[], message: Message) => Promise<string | null>;

    /**
     * Checks the type of a given value
     * @param value the value to check
     * @param type the typeof to validate
     * @param error the error to return
     */
    export function parse<T>(value: string, type: string, error: T): { error: T | null, value: any } {
        try {
            value = JSON.parse(value);
            if (typeof value !== type) {
                return { error, value };
            }
            return { error: null, value };
        } catch (e) {
            return { error, value };
        }
    }

    /**
     * Functions related to extracting IDs from strings
     */
    export namespace Matching {
        const channelRegex = /(?:<?#?)(\d{17,19})(?:>?)/g;
        const userRegex = /(?:<?@?!?)(\d{17,19}|1)(?:>?)/g;
        const roleRegex = /(?:<?@?&?)(\d{17,19}|1)(?:>?)/g

        /**
         * Extracts the channel ID
         * @param str the string to match
         */
        export const channel = (str: string) => {
            channelRegex.lastIndex = 0;
            const match = channelRegex.exec(str);
            return match && match[1];
        }

        /**
         * Extracts the UID
         * @param str the string to match
         */
        export const user = (str: string) => {
            userRegex.lastIndex = 0;
            const match = userRegex.exec(str);
            return match && match[1];
        }

        export const role = (role: string) => {
            roleRegex.lastIndex = 0;
            const match = roleRegex.exec(role);
            return match && match[1];
        }
    }
}

/**
 * Creates an argument parsing guard
 * @param desc The command description
 * @param args The command arguments
 * @param command The command itself
 */
export const Argumented: (command: Command) => CommandHandler = (command) => {
    // every idx of validators array corresponds to args array
    const validators: Array<{ name: string, validator: ArgumentSDK.Validator } | null> = [];

    let syntax: string = `${Constants.COMMAND_PREFIX}${command.opts.name}`;

    const args = command.opts.usage!.args || [];

    for (let argIndex = 0; argIndex < args.length; argIndex++) {
        const arg = args[argIndex];
        if (!arg) {
            // there's no argument data for this, including a name. we use param{idx} as the name
            syntax += ` <param${argIndex}>`;
            validators[argIndex] = null;
            continue;
        }
        const { name, type, unlimited, required } = arg;
        // appends this argument slot to the syntax str
        syntax += ` <${unlimited ? '...' : ''}${name}${required === false ? "?" : ""}>`;
        validators[argIndex] = {
            name,
            validator: async (args, msg) => {
                let checkParams: string[] = unlimited ? args.slice(argIndex) : [args[argIndex]];
                checkParams = checkParams.filter(param => typeof param !== "undefined");

                if (checkParams.length === 0) {
                    if (required !== false) {
                        return "This argument is required.";
                    }
                    return null;
                }

                switch (type) {
                    case "string":
                        // there's really nothing to validate if it's a string, it's already a string.
                        break;
                    // boolean and number are identical in how they're parsed, so they're the same handling code
                    case "boolean":
                    case "number":
                        for (let i = 0; i < checkParams.length; i++) {
                            const param = checkParams[i];
                            const result = ArgumentSDK.parse(param, type, `Must be a ${type}.`);
                            checkParams[i] = result.value;
                            if (result.error) {
                                return result.error;
                            }
                        }
                        break;
                    case "user":
                    case "member":
                        for (let i = 0; i < checkParams.length; i++) {
                            const param = checkParams[i];
                            let userID = ArgumentSDK.Matching.user(param);
                            checkParams[i] = userID && (type === "member" ? msg.guild.members : msg.client.users).get(userID) as any;
                            if (!checkParams[i]) {
                                return `Must be a ${type}`;
                            }
                        }
                        break;
                    case "guild":
                        for (let i = 0; i < checkParams.length; i++) {
                            const param = checkParams[i];
                            checkParams[i] = msg.client.guilds.get(param) as any;
                            if (!checkParams[i]) {
                                return `Must be a ${type}`;
                            }
                        }
                        break;
                    case "channel":
                        for (let i = 0; i < checkParams.length; i++) {
                            const param = checkParams[i];
                            let channelID = ArgumentSDK.Matching.channel(param);
                            checkParams[i] = channelID && msg.client.channels.get(channelID) as any;
                            if (!checkParams[i]) {
                                return `Must be a ${type}`;
                            }
                        }
                        break;
                    case "message":
                        for (let i = 0; i < checkParams.length; i++) {
                            const param = checkParams[i];
                            if (!(checkParams[argIndex] = await msg.channel.fetchMessage(param) as any)) {
                                return `Must be a ${type}`;
                            }
                        }
                        break;
                    case "role":
                        for (let i = 0; i < checkParams.length; i++) {
                            const param = checkParams[i];
                            let roleID = ArgumentSDK.Matching.user(param);
                            checkParams[argIndex] = msg.guild.roles.get(roleID!) as any;
                            if (!checkParams[i]) {
                                return `Must be a ${type}`;
                            }
                        }
                        break;
                    default:
                        return await type(args, msg);
                }

                args.insert(argIndex, checkParams);

                return null;
            }
        };
    }

    (command.opts.usage! as any).syntax = syntax;

    return async (message, next) => {
        const issues: Array<string | null> = [];
        let error: boolean = false;
        for (let i = 0; i < validators.length; i++) {
            const validator = validators[i];
            if (!validator) {
                issues[i] = null;
                continue;
            }
            error = error ? true : !!(issues[i] = await validator.validator(message.args as string[], message));
        }
        // there's no errors, so we call next and continue the command flow
        if (!error) return next();
        const embed = new RichEmbed();
        embed.setTitle(`Syntax errors for ${command.opts.name}`);
        embed.addField("Syntax", `\`${syntax}\``);
        for (let i = 0; i < issues.length; i++) {
            const validator = validators[i];
            // again, we use a placeholder name if there's no validator. this is unlikely to happen though. just satisfies tsc.
            const name = validator ? validator.name : `param${i}`;
            const issue = issues[i];
            // we include the type so we can hint to the user what exactly must be provided,
            // just in case the error message is vague.
            let type = args[i] && ` (type: ${args[i]!.type})`;
            if (typeof type !== "string") type = "" as any;
            embed.addField(name, issue ? `${Constants.WARNING_EMOJI} ${issue}${type}` : `${Constants.SUCCESS_EMOJI}${type}`, true);
        }
        await Promise.all([message.reply(embed), message.warning()]);
    };
};

export type ArgumentType = ArgumentSDK.ArgumentType;