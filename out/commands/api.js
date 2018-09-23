"use strict";
// This file adds additional functions to Discord.JS prototypes
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = require("./util");
const Constants_1 = require("../Constants");
const errors_1 = require("./errors");
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
        util_1.CommandUtils.specializeEmbed(options.embed);
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
    return this.react(Constants_1.SUCCESS_EMOJI);
};
discord_js_1.Message.prototype.warning = discord_js_1.Message.prototype.danger = discord_js_1.Message.prototype.caution = function () {
    return this.react(Constants_1.FAIL_EMOJI);
};
discord_js_1.Message.prototype.fail = function () {
    return this.react(Constants_1.FAIL_EMOJI);
};
discord_js_1.Message.prototype.reject = function (error) {
    const { render } = error || errors_1.CommandError.GENERIC({});
    return this.reply(typeof render === "string" ? render : "", { embed: typeof render === "object" ? render : undefined });
};
discord_js_1.Message.prototype.data = {};
discord_js_1.GuildMember.prototype.hasAccess = async function (commandName) {
    const verify = (role) => {
        for (let [, { id }] of this.roles) {
            if (Constants_1.ROLES_INCLUSIVE[role].includes(id))
                return true;
        }
        return false;
    };
    const command = this.client.botkit.commandSystem.commands[commandName];
    if (!command)
        return false;
    const access = command.opts.access || util_1.AccessLevel.EVERYONE;
    switch (access) {
        case util_1.AccessLevel.EVERYONE:
            return true;
        default:
            return verify(access);
    }
};
discord_js_1.User.prototype.hasAccess = async function (commandName) {
    const command = this.client.botkit.commandSystem.commands[commandName];
    if (!command)
        return false;
    let access = command.opts.access || util_1.AccessLevel.EVERYONE;
    if (access === util_1.AccessLevel.EVERYONE)
        return true;
    if (access === util_1.AccessLevel.MODERATOR || util_1.AccessLevel.ADMIN)
        access = util_1.AccessLevel.ROOT;
    const guilds = await this.guilds();
    for (let [, guild] of guilds)
        if (await guild.members.get(this.id).hasAccess(access))
            return true;
    return false;
};
discord_js_1.User.prototype.guilds = async function () {
    const collection = new discord_js_1.Collection();
    for (let [, guild] of this.client.guilds)
        if (guild.members.has(this.id))
            collection.set(this.id, guild);
    return collection;
};
//# sourceMappingURL=api.js.map