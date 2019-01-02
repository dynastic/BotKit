"use strict";
// This file adds additional functions to Discord.JS prototypes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Constants_1 = __importDefault(require("../Constants"));
const util_1 = require("../util");
const errors_1 = require("./errors");
const permissions_1 = require("./permissions");
const util_2 = require("./util");
const mentionRegex = /⦗<@\d+>⦘/g;
/**
 * Preserves or adds the user mention string when editing a message
 * @param message the message to modify
 * @param content the new content, if any
 * @param options the options, if any
 */
const update = (message, content, options) => {
    if (!options)
        options = {};
    if (typeof content === "string") {
        content = `${content.length > 0 ? `: ${content}` : ''}`;
    }
    else {
        options = content;
        content = "";
    }
    const match = message.content.match(mentionRegex);
    const tag = match && match[0] || `⦗<@${message.author.id}>⦘`;
    content = `${tag}${content}`;
    if (options.embed) {
        util_2.CommandUtils.specializeEmbed(options.embed);
    }
    return { content, options };
};
discord_js_1.Message.prototype.reply = function (content, options) {
    const patches = update(this, content, options);
    content = patches.content, options = patches.options;
    return this.channel.send(content, options);
};
const oldEdit = discord_js_1.Message.prototype.edit;
discord_js_1.Message.prototype.edit = function (content, options) {
    const patches = update(this, content, options);
    content = patches.content, options = patches.options;
    return oldEdit.call(this, content, options);
};
discord_js_1.Message.prototype.complete = discord_js_1.Message.prototype.success = discord_js_1.Message.prototype.done = function () {
    return this.react(Constants_1.default.SUCCESS_EMOJI);
};
discord_js_1.Message.prototype.warning = discord_js_1.Message.prototype.danger = discord_js_1.Message.prototype.caution = function () {
    return this.react(Constants_1.default.FAIL_EMOJI);
};
discord_js_1.Message.prototype.fail = function () {
    return this.react(Constants_1.default.FAIL_EMOJI);
};
discord_js_1.Message.prototype.renderError = function (error) {
    const { render } = error || errors_1.CommandError.GENERIC({});
    Object.defineProperty(this, "errored", {
        value: true,
        writable: false
    });
    return this.reply(typeof render === "string" ? render : "", { embed: typeof render === "object" ? render : undefined });
};
discord_js_1.Message.prototype.data = {};
const oldSetup = discord_js_1.Message.prototype.setup;
discord_js_1.Message.prototype.setup = function (data) {
    this.__data = data;
    return oldSetup.call(this, data);
};
discord_js_1.GuildMember.prototype.hasAccess = async function (commandName) {
    const command = this.client.botkit.commandSystem.commands[commandName];
    if (!command)
        return false;
    const verify = async (role) => {
        const ROLES_INCLUSIVE = util_1.calculateInclusiveRoles();
        if (ROLES_INCLUSIVE[role].includes(this.id))
            return true;
        for (let [, { id }] of this.roles) {
            if (ROLES_INCLUSIVE[role].includes(id))
                return true;
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
            const set = await permissions_1.PermissionsAPI.compositePermissionSet(entities);
            if (permissions_1.PermissionsAPI.nodeSatisfiesSet(command.opts.node, set)) {
                return true;
            }
        }
        return false;
    };
    const access = command.opts.access || util_2.AccessLevel.EVERYONE;
    switch (access) {
        case util_2.AccessLevel.EVERYONE:
            return true;
        default:
            return await verify(access);
    }
};
discord_js_1.User.prototype.hasAccess = async function (commandName) {
    const command = this.client.botkit.commandSystem.commands[commandName];
    if (!command)
        return false;
    let access = command.opts.access || util_2.AccessLevel.EVERYONE;
    return access === util_2.AccessLevel.EVERYONE || !!(this.client.botkit.options.superuserCheck && this.client.botkit.options.superuserCheck(this.id));
};
discord_js_1.User.prototype.guilds = async function () {
    const collection = new discord_js_1.Collection();
    for (let [, guild] of this.client.guilds)
        if (guild.members.has(this.id))
            collection.set(this.id, guild);
    return collection;
};
discord_js_1.RichEmbed.prototype.footer = new Proxy({
    text: null,
    text_mutated: false,
    icon_url: null,
    icon_mutated: false
}, {
    get(target, key) {
        if (key === "text") {
            return target.text_mutated ? target.text : Constants_1.default.BOT_AUTHOR;
        }
        if (key === "icon_url") {
            return target.icon_mutated ? target.icon_url : Constants_1.default.BOT_ICON;
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
//# sourceMappingURL=api.js.map