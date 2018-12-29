"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
exports.EnvironmentGuard = env => (message, next) => {
    if (!env.includes(message.channel.type)) {
        return next(new errors_1.CommandError({
            message: "This command is not available for this channel environment."
        }));
    }
    next();
};
//# sourceMappingURL=environment.js.map