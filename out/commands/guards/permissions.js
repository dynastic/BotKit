"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const permissions_1 = require("../permissions");
/**
 * Basic permissions calculation guard
 * @param message the message
 * @param next the next function
 */
exports.Permissions = async (message, next) => {
    const PermissionsEntity = message.client.botkit.options.permissionsEntity;
    const { node } = message.command.opts;
    // for superusers
    if (message.hasPermission) {
        return next();
    }
    // if there's no node, hasPermission = true, otherwise default to false
    message.hasPermission = !message.command.opts.node;
    if (!PermissionsEntity) {
        util_1.Logger.warn("Permissions guard was called but no PermissionsEntity is defined.");
        return next();
    }
    // if there's no node, stop trying to compute
    if (!node) {
        return next();
    }
    // we don't do permissions in a DM, it's either superuser or the command doesn't have a permission requirement
    if (!message.guild) {
        util_1.Logger.debug("Message is not from a guild. Permission computation will not continue.");
        return next();
    }
    const { roles, id } = message.member;
    const roleIDs = roles.map(r => r.id);
    const entities = await PermissionsEntity.createQueryBuilder("set")
        .where("set.roles @> :roleIDs", { roleIDs })
        .orWhere("set.members @> :id", { id: [id] })
        .getMany();
    // create a composite set of all of the permission sets
    const set = await permissions_1.PermissionsAPI.compositePermissionSet(entities);
    message.hasPermission = permissions_1.PermissionsAPI.nodeSatisfiesSet(node, set);
    next();
};
//# sourceMappingURL=permissions.js.map