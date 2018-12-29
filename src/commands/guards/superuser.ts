import { CommandHandler } from "../util";

export type SuperuserCheck = (id: string) => boolean;

export const Superuser: CommandHandler = (message, next) => {
    const { superuserCheck } = message.client.botkit.options;

    if (!superuserCheck || !superuserCheck(message.author.id)) return next();

    Object.defineProperty(message, "hasPermission", {
        value: true,
        writable: false
    });
    
    next();
}