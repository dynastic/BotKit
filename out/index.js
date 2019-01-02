"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commands_1 = __importDefault(require("./commands"));
const Constants_1 = __importDefault(require("./Constants"));
require("./node-additions");
require("./override");
/**
 * Initializes the framework
 */
class Application {
    constructor(options) {
        this.options = options;
        Constants_1.default.applyPatches({
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
    }
}
exports.Application = Application;
exports.default = Application;
__export(require("./commands"));
exports.Constants = Constants_1.default;
__export(require("./db"));
__export(require("./modules"));
__export(require("./util"));
//# sourceMappingURL=index.js.map