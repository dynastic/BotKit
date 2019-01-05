"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../errors");
exports.BotPermissions = (...perms) => async (message, next) => {
    const self = message.guild.me;
    const missing = perms.filter(perm => perm === "OWNER" ? self.id === message.guild.ownerID : !self.hasPermission(perm));
    const pass = missing.length === 0;
    if (pass) {
        return next();
    }
    await message.fail();
    return next(new errors_1.CommandError({
        message: `I don't have permission to do that. Please give me the following permissions and try again:\n${missing.map(perm => `\`${perm}\``).join("\n")}`,
        title: "Missing Permissions"
    }));
};
//# sourceMappingURL=bot-permisisons.js.map