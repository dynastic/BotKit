"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Constants = __importStar(require("./Constants"));
const commands_1 = __importDefault(require("./commands"));
/**
 * Initializes the framework
 */
class Application {
    constructor(options) {
        this.options = options;
        Constants.applyPatches({
            COMMAND_PREFIX: options.COMMAND_PREFIX,
            ERROR_RENDER_FORMAT: options.ERROR_RENDER_FORMAT,
            ROLES: options.ROLES
        });
    }
    /**
     * Sets the Discord client up and loads the command system
     */
    async init() {
        this.client = this.options.client || new discord_js_1.Client();
        this.client.botkit = this;
        if (!this.client.readyTimestamp) {
            await this.client.login(this.options.token);
        }
        this.commandSystem = new commands_1.default({ directory: this.options.commandDirectory, app: this, preloadExclude: this.options.preloadExclude, automaticCategoryNames: this.options.automaticCategoryNames });
        await this.commandSystem.init();
        this.client.on("message", message => {
            if (!message.cleanContent.startsWith(Constants.COMMAND_PREFIX))
                return;
            this.commandSystem.executeCommand(message);
        });
    }
}
exports.Application = Application;
exports.default = Application;
exports.Constants = require("./Constants");
__export(require("./util"));
__export(require("./db"));
__export(require("./commands"));
//# sourceMappingURL=index.js.map