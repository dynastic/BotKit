// This file adds additional functions to Discord.JS prototypes

import { Collection, RichEmbed, Guild, GuildMember, Message, MessageOptions, User } from 'discord.js';

import Application from '..';
import { AccessLevel, CommandUtils } from './util';
import { ROLES, ROLES_INCLUSIVE, SUCCESS_EMOJI, FAIL_EMOJI, BOT_AUTHOR, BOT_ICON } from '../Constants';
import { CommandError } from './errors';

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
        CommandUtils.specializeEmbed(options!.embed!);
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

Message.prototype.complete = Message.prototype.success = Message.prototype.done = function(this: Message) {
    return this.react(SUCCESS_EMOJI) as any as Promise<void>;
}

Message.prototype.warning = Message.prototype.danger = Message.prototype.caution = function(this: Message) {
    return this.react(FAIL_EMOJI) as any as Promise<void>;
}

Message.prototype.fail = function(this: Message) {
    return this.react(FAIL_EMOJI) as any as Promise<void>;
}

Message.prototype.reject = function(this: Message, error) {
    const {render} = error || CommandError.GENERIC({});
    return this.reply(typeof render === "string" ? render : "", {embed: typeof render === "object" ? render : undefined}) as any as Promise<void>;
}

Message.prototype.data = {};

GuildMember.prototype.hasAccess = async function(this: GuildMember, commandName: string | AccessLevel) {
    const verify = (role: "moderator" | "admin" | "root") => {
        for (let [,{id}] of this.roles) {
            if (ROLES_INCLUSIVE[role].includes(id)) return true;
        }
        return false;
    }
    const command = this.client.botkit.commandSystem.commands[commandName];
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
    const command = this.client.botkit.commandSystem.commands[commandName];
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

RichEmbed.prototype.footer = new Proxy({
    text: null as any,
    text_mutated: false,
    icon_url: null as any,
    icon_mutated: false
}, {
    get(target, key) {
        if (key === "text") {
            return target.text_mutated ? target.text : BOT_AUTHOR;
        }
        if (key === "icon_url") {
            return target.icon_mutated ? target.icon_url : BOT_ICON;
        }
        return undefined;
    },
    set(target, key, value) {
        target[key] = value;
        if (key === "text") {
            target.text_mutated = true;
        }
        if (key === "icon_url") {
            target.icon_mutated = true;
        }
        return true;
    }
});