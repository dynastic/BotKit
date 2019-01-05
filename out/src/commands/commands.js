"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const errors_1 = require("./errors");
exports.HelpCommand = {
    opts: {
        name: "help",
        usage: {
            description: "Provides help about all commands in this bot",
            args: [
                {
                    name: "command",
                    type: "string",
                    required: false,
                    description: "The command to look up"
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
                embed.setDescription(description);
            if (syntax)
                embed.addField("Syntax", `\`${message.commandPrefix}${syntax}\``);
            if (usage.args) {
                usage.args.forEach((arg, i) => {
                    if (!arg) {
                        return;
                    }
                    const title = `${i}${arg.unlimited ? "..." : "."} ${arg.name.capitalize()}`;
                    let body = "";
                    if (arg.description)
                        body += `Description: \`${arg.description}\`\n`;
                    body += `Type: \`${arg.type}\`\n`;
                    body += `Optional: \`${arg.required === false}\``;
                    embed.addField(title, body);
                });
            }
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
            (commands[category] || (commands[category] = [])).push(`• \`${message.commandPrefix}${command.opts.name}\``);
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
const pingSuffix = () => ['?', '!', '?!', '!?', '?!?', '!?!', '!!?', '?!!', '!?!'].random();
exports.PingCommand = {
    opts: {
        name: "ping",
        category: "Diagnostics",
        usage: {
            description: "Calculates the latency between the bot and server"
        }
    },
    handler: async (message, next) => {
        const startTime = Date.now();
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle(`Ping${pingSuffix()} Ping${pingSuffix()} Ping${pingSuffix()}`);
        embed.setDescription(`Ping${pingSuffix()}`);
        let msg;
        const reloadVariables = () => {
            embed.fields = [];
            const startToNow = Date.now() - message.metrics.start;
            embed.addField(`Command runtime duration  `, `${startToNow}ms`, true);
            if (msg)
                embed.addField(`Message ponged in`, `${msg.createdTimestamp - startTime}ms`, true);
        };
        reloadVariables();
        msg = await message.channel.send(embed);
        reloadVariables();
        embed.setDescription("***PONG.***");
        await msg.edit(embed);
    }
};
exports.EvalCommand = {
    opts: {
        name: "eval",
        category: "Diagnostics",
        node: "debug.eval",
        usage: {
            description: "Evaluates the given code",
            args: [
                {
                    type: "string",
                    name: "code",
                    required: true,
                    unlimited: true,
                    description: "The code you want to evaluate"
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