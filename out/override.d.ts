import Application from ".";
import { PermissionSetEntityStub } from "./commands";
declare module "discord.js" {
    interface Client {
        botkit: Application<PermissionSetEntityStub>;
    }
}
