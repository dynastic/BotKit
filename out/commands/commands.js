"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const Constants_1 = require("../Constants");
const errors_1 = require("./errors");
const guards_1 = require("./guards");
const util_2 = require("./util");
exports.HelpCommand = {
    opts: {
        name: "help",
        access: util_2.AccessLevel.EVERYONE,
        guards: [guards_1.Argumented("help", "Provides help about all commands in this bot", [{ name: "command", type: "string", required: false }])]
    },
    handler: async (message, next) => {
        const [specificCommand] = message.args;
        // command manpage
        if (specificCommand) {
            const command = message.client.botkit.commandSystem.commands[specificCommand];
            if (!command) {
                return next(new errors_1.CommandError({ message: "That command does not exist." }));
            }
            const metadata = message.client.botkit.commandSystem.metadata[command.opts.name];
            if (!metadata || (!metadata.description && !metadata.syntax)) {
                return next(new errors_1.CommandError({ message: "There's no additional help data for this command." }));
            }
            const { description, syntax } = metadata;
            const embed = new discord_js_1.RichEmbed();
            embed.setTitle(`Information about \`${command.opts.name}\``);
            if (description)
                embed.addField("Description", description);
            if (syntax)
                embed.addField("Syntax", `\`${syntax}\``);
            await message.reply(embed);
            return;
        }
        const commands = {};
        const loadedCommands = message.client.botkit.commandSystem.commands;
        for (let commandName in loadedCommands) {
            if (!(await (message.member || message.author).hasAccess(commandName)))
                continue;
            const command = loadedCommands[commandName];
            if (!command)
                continue;
            const category = command.opts.category || "General";
            (commands[category] || (commands[category] = [])).push(`• \`${Constants_1.COMMAND_PREFIX}${command.opts.name}\``);
        }
        const helpEmbed = new discord_js_1.RichEmbed();
        for (let category in commands) {
            const commandList = commands[category].join("\n");
            helpEmbed.addField(`${category}:`, commandList);
        }
        helpEmbed.setTitle("Available Commands");
        message.reply("", { embed: helpEmbed });
    }
};
exports.PingCommand = {
    opts: {
        name: "ping",
        category: "Diagnostics",
        access: util_2.AccessLevel.EVERYONE,
        guards: [guards_1.Argumented("ping", "Calculates the latency between the bot and server", [])]
    },
    handler: async (message, next) => {
        const startTime = Date.now();
        const msg = await message.reply("Ping...");
        await msg.edit(`Ponged in ${msg.createdTimestamp - startTime}ms`);
    }
};
exports.EvalCommand = {
    opts: {
        name: "eval",
        category: "Diagnostics",
        access: util_2.AccessLevel.ROOT,
        guards: [guards_1.Argumented("eval", "Evaluates the given code", [{ name: "code", type: "string", required: true, unlimited: true }])]
    },
    handler: async (message, next) => {
        const context = {
            message,
            app: message.client.botkit,
            args: message.args,
            author: message.author,
            channel: message.channel,
            guild: message.guild,
            client: message.client
        };
        let res;
        try {
            res = eval(message.args.join(" "));
        }
        catch (e) {
            res = e;
        }
        const getResult = () => "Result\n```js\n" + util_1.default.inspect(res, false, 0) + "\n```";
        if (res instanceof Promise) {
            const response = await message.reply("Promise Pending...");
            try {
                res = await res;
            }
            catch (e) {
                res = e;
            }
            await response.edit(getResult());
            return;
        }
        await message.reply(getResult());
    }
};
exports.Moderation = {
    opts: {
        access: util_2.AccessLevel.MODERATOR,
        category: "Moderation"
    },
    commands: [
        {
            opts: {
                name: "erase-channel",
                guards: [guards_1.Argumented("erase-channel", "Erases all messages in the specified channel", [
                        { name: "channel", type: "channel" }
                    ])]
            },
            handler: async (msg, next) => {
                let messages;
                while ((messages = await msg.args[0].fetchMessages({ limit: 100 })).size > 0) {
                    await msg.channel.bulkDelete(messages);
                }
                await msg.author.send(`I'm done cleaning <#${msg.channel.id}>`);
            }
        }
    ]
};
exports.UnicodeEmoji = {
    opts: {
        name: "unicode-emoji",
        guards: [
            guards_1.Argumented("unicode-emoji", "Sends the unicode version of the given emoji where applicable", [
                {
                    name: "emoji",
                    type: "string"
                }
            ])
        ]
    },
    handler: msg => msg.reply(`\\${msg.args[0]}`)
};
//# sourceMappingURL=commands.js.map