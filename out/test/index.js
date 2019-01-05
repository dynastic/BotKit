"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = __importStar(require("../src"));
const Config_1 = require("./Config");
const GuildPermissionSet_1 = require("./database/entities/GuildPermissionSet");
const database_1 = require("./database");
exports.app = new src_1.default({
    token: Config_1.Configuration.Bot.token,
    superuserCheck: id => Config_1.Configuration.Bot.superusers.includes(id),
    permissionsEntity: GuildPermissionSet_1.GuildPermissionSet
});
exports.app.init()
    .then(() => database_1.connect())
    .then(() => exports.app.commandSystem.loadCommands(src_1.SetManager))
    .then(() => exports.app.commandSystem.loadCommands(src_1.Essentials));
//# sourceMappingURL=index.js.map