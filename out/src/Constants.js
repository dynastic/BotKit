"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants;
(function (Constants) {
    Constants.SUCCESS_EMOJI = '🆗';
    Constants.FAIL_EMOJI = '❌';
    Constants.WARNING_EMOJI = '⚠';
    Constants.DELETE_EMOJI = '🗑';
    Constants.COMMAND_PREFIX = '*';
    Constants.ARGUMENT_REGEX = /[^'"\s]+|(?:["'])([^'"]+)(?:["'])/g;
    Constants.BOT_ICON = "https://assets.dynastic.co/brand/img/icon-64.png";
    Constants.BOT_AUTHOR = "Dynastic";
    Constants.TEMP_DIR = "/tmp/bot-downloads";
    Constants.COLORS = {
        DANGER: 0xff895e
    };
    let ErrorFormat;
    (function (ErrorFormat) {
        ErrorFormat[ErrorFormat["EMBED"] = 0] = "EMBED";
        ErrorFormat[ErrorFormat["TEXT"] = 1] = "TEXT";
    })(ErrorFormat = Constants.ErrorFormat || (Constants.ErrorFormat = {}));
    Constants.ERROR_RENDER_FORMAT = ErrorFormat.EMBED;
    Constants.ERROR_PREFIX = "**Uh oh!**";
    /**
     * Applies patches to BotKit constants
     * @param patches the patches to apply
     */
    function applyPatches(patches) {
        let script = "";
        for (let key in patches) {
            script += `Constants.${key} = patches.${key} || Constants.${key};`;
        }
        eval(script);
    }
    Constants.applyPatches = applyPatches;
})(Constants || (Constants = {}));
exports.default = Constants;
//# sourceMappingURL=Constants.js.map