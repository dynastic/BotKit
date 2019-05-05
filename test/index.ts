import Application, { SetManager, Essentials, Logger } from "../src";
import { Configuration } from "./Config";
import { GuildPermissionSet } from "./database/entities/GuildPermissionSet";
import { connect } from "./database";

export const app = new Application({
    token: Configuration.Bot.token,
    superuserCheck: id => Configuration.Bot.superusers.includes(id),
    permissionsEntity: GuildPermissionSet
});

app.init()
   .then(() => Logger.info("Discord connected."))
   .then(() => connect())
   .then(() => Logger.info("DB Connected."))
   .then(() => app.commandSystem.loadCommands(SetManager))
   .then(() => app.commandSystem.loadCommands(Essentials))
   .then(() => Logger.info("Bot running."));