import { Collection, Guild, GuildMember, Message, MessageOptions, User } from 'discord.js';

import Application from '..';
import { AccessLevel, specializeEmbed } from './util';
import { ROLES } from '../Constants';

const mentionRegex = /⦗<@\d+>⦘/g;

/**
 * Preserves or adds the user mention string when editing a message
 * @param message the message to modify
 * @param content the new content, if any
 * @param options the options, if any
 */
const update: (message: Message, content?: any, options?: MessageOptions) => {content?: any, options?: MessageOptions} = (message, content, options) => {
    if (!options) options = {};
    if (typeof content === "string") {
        content = `${content.length > 0 ? `: ${content}` : ''}`;
    } else {
        options = content;
        content = "";
    }

    const match = message.content.match(mentionRegex);
    const tag = match && match[0] || `⦗<@${message.author.id}>⦘`;
    content = `${tag}${content}`;

    if (options!.embed) {
        specializeEmbed(options!.embed!);
    }

    return {content, options};
};

Message.prototype.reply = function(this: Message, content?: any, options?: MessageOptions) {
    const patches = update(this, content, options);
    content = patches.content, options = patches.options;

    return this.channel.send(content, options);
};

const oldEdit = Message.prototype.edit;
Message.prototype.edit = function(this: Message, content?: any, options?: MessageOptions) {
    const patches = update(this, content, options);
    content = patches.content, options = patches.options;

    return oldEdit.call(this, content, options);
};

const roles = ROLES;

const moderator: {[key: string]: boolean} = {}, admin: {[key: string]: boolean} = {}, root: {[key: string]: boolean} = {};
for (let rootID of roles.root) moderator[rootID] = admin[rootID] = root[rootID] = true;
for (let adminID of roles.admin) moderator[adminID] = admin[adminID] = true;
for (let moderatorID of roles.moderator) moderator[moderatorID] = true;
const roleList = {moderator, admin, root};

GuildMember.prototype.hasAccess = async function(this: GuildMember, commandName: string | AccessLevel) {
    const verify = (role: "moderator" | "admin" | "root") => {
        for (let [,{id}] of this.roles) {
            if (roleList[role][id]) return true;
        }
        return false;
    }
    if (AccessLevel[commandName.toUpperCase()]) {
        const access = AccessLevel[commandName.toUpperCase()];
        if (access === AccessLevel.EVERYONE) return true;
        return verify(access.toLowerCase());
    }
    const command = Application.singleton.commandSystem.commands[commandName];
    if (!command) return false;
    const access = command.opts.access || AccessLevel.EVERYONE;
    switch (access) {
        case AccessLevel.EVERYONE:
            return true;
        default:
            return verify(access);
    }
}

User.prototype.hasAccess = async function(this: User, commandName: string) {
    const command = Application.singleton.commandSystem.commands[commandName];
    if (!command) return false;

    let access = command.opts.access || AccessLevel.EVERYONE;

    if (access === AccessLevel.EVERYONE) return true;
    
    if (access === AccessLevel.MODERATOR || AccessLevel.ADMIN) access = AccessLevel.ROOT;

    const guilds = await this.guilds();
    for (let [,guild] of guilds)
        if (await guild.members.get(this.id)!.hasAccess(access)) return true;
    return false;
}

User.prototype.guilds = async function(this: User) {
    const collection: Collection<string, Guild> = new Collection();
    for (let [,guild] of this.client.guilds)
        if (guild.members.has(this.id)) collection.set(this.id, guild);
    return collection;
}