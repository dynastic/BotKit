import { PermissionString } from "discord.js";
import { CommandError } from "../errors";
import { CommandHandler } from "../util";

export const BotPermissions: (...perms: PermissionString[]) => CommandHandler = (...perms: PermissionString[]) => async (message, next) => {
    const self = message.guild.me;

    const missing = perms.filter(perm => !self.hasPermission(perm));
    const pass = missing.length === 0;

    if (pass) {
        return next();
    }

    await message.fail();
    return next(new CommandError({
        message: `I don't have permission to do that. Please give me the following permissions and try again:\n${missing.map(perm => `\`${perm}\``).join("\n")}`,
        title: "Missing Permissions"
    }));
}