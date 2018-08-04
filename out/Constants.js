"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUCCESS_EMOJI = '🆗';
exports.FAIL_EMOJI = '❌';
exports.WARNING_EMOJI = '⚠';
exports.DELETE_EMOJI = '🗑';
exports.COMMAND_PREFIX = '*';
exports.ARGUMENT_REGEX = /[^'"\s]+|(?:["'])([^'"]+)(?:["'])/g;
exports.DYNASTIC_ICON = "https://assets.dynastic.co/brand/img/icon-64.png";
exports.TEMP_DIR = "/tmp/bot-downloads";
exports.COLORS = {
    DANGER: 0xff895e
};
var ErrorFormat;
(function (ErrorFormat) {
    ErrorFormat[ErrorFormat["EMBED"] = 0] = "EMBED";
    ErrorFormat[ErrorFormat["TEXT"] = 1] = "TEXT";
})(ErrorFormat = exports.ErrorFormat || (exports.ErrorFormat = {}));
exports.ERROR_RENDER_FORMAT = ErrorFormat.EMBED;
exports.ROLES = { moderator: [], admin: [], root: [] };
exports.ROLES_INCLUSIVE = { moderator: [], admin: [], root: [] };
function applyPatches(patches) {
    exports.COMMAND_PREFIX = patches.commandPrefix || exports.COMMAND_PREFIX;
    exports.ERROR_RENDER_FORMAT = patches.errorFormat || exports.ERROR_RENDER_FORMAT;
    if (patches.roles) {
        Object.assign(exports.ROLES, patches.roles);
        const roles = exports.ROLES;
        const moderator = {}, admin = {}, root = {};
        for (let rootID of roles.root)
            moderator[rootID] = admin[rootID] = root[rootID] = true;
        for (let adminID of roles.admin)
            moderator[adminID] = admin[adminID] = true;
        for (let moderatorID of roles.moderator)
            moderator[moderatorID] = true;
        Object.assign(exports.ROLES_INCLUSIVE, { moderator, admin, root });
    }
}
exports.applyPatches = applyPatches;
//# sourceMappingURL=Constants.js.map