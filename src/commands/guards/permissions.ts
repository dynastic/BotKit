import { CommandHandler } from "../util";
import { Logger } from "../../util";
import { PermissionsAPI } from "../permissions";

/**
 * Basic permissions calculation guard
 * @param message the message
 * @param next the next function
 */
export const Permissions: CommandHandler = async (message, next) => {
    const PermissionsEntity = message.client.botkit.options.permissionsEntity;
    const { node } = message.command.opts;

    // for superusers
    if (message.hasPermission) {
        return next();
    }

    // if there's no node, hasPermission = true, otherwise default to false
    message.hasPermission = !message.command.opts.node;

    if (!PermissionsEntity) {
        Logger.warn("Permissions guard was called but no PermissionsEntity is defined.");
        return next();
    }

    // if there's no node, stop trying to compute
    if (!node) {
        return next();
    }

    // we don't do permissions in a DM, it's either superuser or the command doesn't have a permission requirement
    if (!message.guild) {
        Logger.debug("Message is not from a guild. Permission computation will not continue.");
        return next();
    }

    const { roles, id } = message.member;

    const roleIDs = roles.map(r => r.id);

    const entities = await PermissionsEntity.createQueryBuilder("set")
        .where("set.roles @> :roleIDs", { roleIDs })
        .orWhere("set.members @> :id", { id: [id] })
        .getMany();

    // create a composite set of all of the permission sets
    const set = await PermissionsAPI.compositePermissionSet(entities);

    message.hasPermission = PermissionsAPI.nodeSatisfiesSet(node, set);

    next();
}