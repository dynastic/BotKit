// This file adds additional functions to Discord.JS prototypes

import { Collection, Guild, GuildMember, Message, MessageOptions, RichEmbed, User } from 'discord.js';
import Constants from '../Constants';
import { calculateInclusiveRoles } from '../util';
import { CommandError } from './errors';
import { PermissionsAPI } from './permissions';
import { AccessLevel, CommandUtils } from './util';


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
    return this.react(Constants.SUCCESS_EMOJI) as any as Promise<void>;
}

Message.prototype.warning = Message.prototype.danger = Message.prototype.caution = function(this: Message) {
    return this.react(Constants.FAIL_EMOJI) as any as Promise<void>;
}

Message.prototype.fail = function(this: Message) {
    return this.react(Constants.FAIL_EMOJI) as any as Promise<void>;
}

Message.prototype.renderError = function(this: Message, error) {
    const {render} = error || CommandError.GENERIC({});
    Object.defineProperty(this, "errored", {
        value: true,
        writable: false
    });
    return this.reply(typeof render === "string" ? render : "", {embed: typeof render === "object" ? render : undefined}) as any as Promise<void>;
}

Message.prototype.data = {};

const oldSetup = Message.prototype.setup;
Message.prototype.setup = function(data) {
    this.__data = data;
    return oldSetup.call(this, data);
}

GuildMember.prototype.hasAccess = async function(this: GuildMember, commandName: string | AccessLevel) {
    const command = this.client.botkit.commandSystem.commands[commandName];

    if (!command) return false;

    const verify = async (role: "moderator" | "admin" | "root") => {
        const ROLES_INCLUSIVE = calculateInclusiveRoles();

        if (ROLES_INCLUSIVE[role].includes(this.id)) return true;
        for (let [,{id}] of this.roles) {
            if (ROLES_INCLUSIVE[role].includes(id)) return true;
        }
        const { roles, id } = this;

        if (this.client.botkit.options.superuserCheck) {
            if (this.client.botkit.options.superuserCheck(id)) {
                return true;
            }
        }

        const PermissionsEntity = await this.client.botkit.options.permissionsEntity;
        if (PermissionsEntity && command.opts.node) {

            const roleIDs = roles.map(r => r.id);

            const entities = await PermissionsEntity.createQueryBuilder("set")
                .where("set.roles @> :roleIDs", { roleIDs })
                .orWhere("set.members @> :id", { id: [id] })
                .getMany();

            // create a composite set of all of the permission sets
            const set = await PermissionsAPI.compositePermissionSet(entities);

            if (PermissionsAPI.nodeSatisfiesSet(command.opts.node, set)) {
                return true;
            }
        }

        return false;
    };

    const access = command.opts.access || AccessLevel.EVERYONE;
    switch (access) {
        case AccessLevel.EVERYONE:
            return true;
        default:
            return await verify(access);
    }
}

User.prototype.hasAccess = async function(this: User, commandName: string) {
    const command = this.client.botkit.commandSystem.commands[commandName];
    if (!command) return false;

    let access = command.opts.access || AccessLevel.EVERYONE;

    return access === AccessLevel.EVERYONE || !!(this.client.botkit.options.superuserCheck && this.client.botkit.options.superuserCheck(this.id));
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
            return target.text_mutated ? target.text : Constants.BOT_AUTHOR;
        }
        if (key === "icon_url") {
            return target.icon_mutated ? target.icon_url : Constants.BOT_ICON;
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