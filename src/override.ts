import Application from ".";
import { PermissionSetEntityStub } from "./commands";

declare module "discord.js" {
    export interface Client {
        botkit: Application<PermissionSetEntityStub>;
    }
}