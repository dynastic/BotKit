import {CommandError} from './errors';
import { AccessLevel, CommandHandler } from './util';

export const PermissionGuard: CommandHandler = async (msg, next) => {
    const access = msg.command.opts.access || AccessLevel.EVERYONE;
    if (await (msg.member || msg.author).hasAccess(msg.command.opts.name)) return next();
    return next(new CommandError({message: `You must have ${access} clearance or higher to do that.`}));
}

export * from "./guards/index";