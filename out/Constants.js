"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUCCESS_EMOJI = '🆗';
exports.FAIL_EMOJI = '❌';
exports.WARNING_EMOJI = '⚠';
exports.DELETE_EMOJI = '🗑';
exports.COMMAND_PREFIX = '*';
exports.ARGUMENT_REGEX = /[^'"\s]+|(?:["'])([^'"]+)(?:["'])/g;
exports.BOT_ICON = "https://assets.dynastic.co/brand/img/icon-64.png";
exports.BOT_AUTHOR = "Dynastic";
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
function recalculateInclusiveRoles() {
    const moderator = {}, admin = {}, root = {};
    for (let rootID of exports.ROLES.root)
        moderator[rootID] = admin[rootID] = root[rootID] = true;
    for (let adminID of exports.ROLES.admin)
        moderator[adminID] = admin[adminID] = true;
    for (let moderatorID of exports.ROLES.moderator)
        moderator[moderatorID] = true;
    exports.ROLES_INCLUSIVE = { moderator: Object.keys(moderator), admin: Object.keys(admin), root: Object.keys(root) };
}
function applyPatches(patches) {
    let script = "";
    for (let key in patches) {
        script += `exports.${key} = patches.${key} || exports.${key};`;
    }
    eval(script);
    if (patches.ROLES) {
        recalculateInclusiveRoles();
    }
}
exports.applyPatches = applyPatches;
//# sourceMappingURL=Constants.js.map