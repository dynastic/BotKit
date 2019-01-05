import { PermissionString } from "discord.js";
import { CommandError } from "../../errors";
import { CommandHandler } from "../../util";

export type ExtraPermissionString = PermissionString | "OWNER";

export const BotPermissions: (...perms: ExtraPermissionString[]) => CommandHandler = (...perms: ExtraPermissionString[]) => async (message, next) => {
    const self = message.guild.me;

    const missing = perms.filter(perm => perm === "OWNER" ? self.id === message.guild.ownerID : !self.hasPermission(perm));
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