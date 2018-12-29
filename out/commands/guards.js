"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const util_1 = require("./util");
/**
 * Simple guard which ensures a user has a given access level
 * @param msg the message to check against
 * @param next next function
 */
exports.PermissionGuard = async (msg, next) => {
    const access = msg.command.opts.access || util_1.AccessLevel.EVERYONE;
    if (await (msg.member || msg.author).hasAccess(msg.command.opts.name))
        return next();
    if (msg.hasPermission)
        return next();
    const message = msg.command.opts.node ? `You do not have permission to do that.` : `You must have ${access} clearance or higher to do that.`;
    return next(new errors_1.CommandError({ message: `You must have ${access} clearance or higher to do that.` }));
};
__export(require("./guards/index"));
//# sourceMappingURL=guards.js.map