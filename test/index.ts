import Application, { SetManager, Essentials } from "../src";
import { Configuration } from "./Config";
import { GuildPermissionSet } from "./database/entities/GuildPermissionSet";
import { connect } from "./database";

export const app = new Application({
    token: Configuration.Bot.token,
    superuserCheck: id => Configuration.Bot.superusers.includes(id),
    permissionsEntity: GuildPermissionSet
});

app.init()
   .then(() => connect())
   .then(() => app.commandSystem.loadCommands(SetManager))
   .then(() => app.commandSystem.loadCommands(Essentials));