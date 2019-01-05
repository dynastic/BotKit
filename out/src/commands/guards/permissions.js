"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
/**
 * Calculates the permissions
 */
exports.PermissionsGuard = async (message, next) => {
    const { superuserCheck } = message.client.botkit.options;
    // set DISABLE_PERMISSIONS to anything and permisisons will just *work*!
    if (process.env.DISABLE_PERMISSIONS || (superuserCheck && superuserCheck(message.author.id))) {
        Object.defineProperty(message, "hasPermission", {
            value: true,
            writable: false
        });
    }
    // for superusers
    if (message.hasPermission) {
        return next();
    }
    message.hasPermission = await (message.member || message.author).hasAccess(message.command.opts.name);
    if (!message.hasPermission) {
        return next(new errors_1.CommandError({ message: `You do not have permission to do that.` }));
    }
    next();
};
/**
 * Loads permission sets if they are in the first argument
 */
exports.PermSetLoader = async (message, next) => {
    const [name] = message.args.map(r => r.toString());
    const guild = message.guild.id;
    const permSet = message.data.permSet = await message.client.botkit.options.permissionsEntity.findOne({ name: name.toString(), guild });
    if (!permSet) {
        return next(errors_1.CommandError.NOT_FOUND("No permission set with that name exists."));
    }
    next();
};
//# sourceMappingURL=permissions.js.map