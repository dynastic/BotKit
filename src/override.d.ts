import Application from ".";

declare module "discord.js" {
    export interface Client {
        botkit: Application;
    }
}