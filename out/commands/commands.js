"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const Constants_1 = __importDefault(require("../Constants"));
const errors_1 = require("./errors");
const util_2 = require("./util");
exports.HelpCommand = {
    opts: {
        name: "help",
        access: util_2.AccessLevel.EVERYONE,
        usage: {
            description: "Provides help about all commands in this bot",
            args: [
                {
                    name: "command",
                    type: "string", required: false
                }
            ]
        }
    },
    handler: async (message, next) => {
        const [specificCommand] = message.args;
        // command manpage
        if (specificCommand) {
            const command = message.client.botkit.commandSystem.commands[specificCommand];
            if (!command) {
                return next(new errors_1.CommandError({ message: "That command does not exist." }));
            }
            const { usage } = command.opts;
            if (!usage) {
                return next(new errors_1.CommandError({ message: "There's no additional help data for this command." }));
            }
            const { description, syntax } = usage;
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
            (commands[category] || (commands[category] = [])).push(`• \`${Constants_1.default.COMMAND_PREFIX}${command.opts.name}\``);
        }
        const helpEmbed = new discord_js_1.RichEmbed();
        for (let category in commands) {
            const commandList = commands[category].join("\n");
            helpEmbed.addField(`${category}:`, commandList, true);
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
        usage: {
            description: "Calculates the latency between the bot and server"
        }
    },
    handler: async (message, next) => {
        const startTime = Date.now();
        const msg = await message.channel.send("Ping...");
        await msg.edit(`Ponged in ${msg.createdTimestamp - startTime}ms`);
    }
};
exports.EvalCommand = {
    opts: {
        name: "eval",
        category: "Diagnostics",
        access: util_2.AccessLevel.ROOT,
        node: "debug.eval",
        usage: {
            description: "Evaluates the given code",
            args: [
                {
                    type: "string",
                    name: "code",
                    required: true,
                    unlimited: true
                }
            ]
        }
    },
    handler: async (message, next) => {
        let context = {
            message,
            app: message.client.botkit,
            args: message.args,
            author: message.author,
            channel: message.channel,
            guild: message.guild,
            client: message.client
        };
        if (message.client.botkit.options.contextPopulator) {
            context = message.client.botkit.options.contextPopulator(context);
        }
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
//# sourceMappingURL=commands.js.map