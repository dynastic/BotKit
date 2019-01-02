import { Client, Guild, Message, TextChannel, User } from 'discord.js';
import { Application } from '..';
import { Command } from './util';
export declare const HelpCommand: Command;
export declare const PingCommand: Command;
export interface Context {
    message: Message;
    app: Application;
    args: string[];
    author: User;
    channel: TextChannel;
    guild: Guild;
    client: Client;
    [key: string]: any;
}
export declare const EvalCommand: Command;
