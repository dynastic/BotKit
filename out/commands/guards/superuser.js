"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Superuser = (message, next) => {
    const { superuserCheck } = message.client.botkit.options;
    if (!superuserCheck || !superuserCheck(message.author.id))
        return next();
    Object.defineProperty(message, "hasPermission", {
        value: true,
        writable: false
    });
    next();
};
//# sourceMappingURL=superuser.js.map