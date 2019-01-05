import { Channel, Guild, GuildMember, Message, Role, User } from "discord.js";
import { Command, CommandHandler } from "../../util";
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
export declare namespace ArgumentSDK {
    /**
     * An argument slot.
     */
    interface Argument {
        name: string;
        /**
         * If the type is a function, it takes the place of a validator function and returns the error or null.
         */
        type: "string" | "boolean" | "number" | "user" | "member" | "guild" | "channel" | "message" | "role" | Validator;
        unlimited?: boolean;
        required?: boolean;
        description?: string;
    }
    type ArgumentType = boolean | number | string | User | GuildMember | Guild | Channel | Message | Role;
    /**
     * A function that inspects the arguments and returns errors, or null.
     *
     * The function takes the entire argument array but should inspect only one
     * argument, as each validator function is for a specific argument slot.
     */
    type Validator = (args: string[], message: Message) => Promise<string | null>;
    /**
     * Checks the type of a given value
     * @param value the value to check
     * @param type the typeof to validate
     * @param error the error to return
     */
    function parse<T>(value: string, type: string, error: T): {
        error: T | null;
        value: any;
    };
    /**
     * Functions related to extracting IDs from strings
     */
    namespace Matching {
        /**
         * Extracts the channel ID
         * @param str the string to match
         */
        const channel: (str: string) => string | null;
        /**
         * Extracts the UID
         * @param str the string to match
         */
        const user: (str: string) => string | null;
        const role: (role: string) => string | null;
    }
}
/**
 * Creates an argument parsing guard
 * @param desc The command description
 * @param args The command arguments
 * @param command The command itself
 */
export declare const Argumented: (command: Command) => CommandHandler;
export declare type ArgumentType = ArgumentSDK.ArgumentType;
