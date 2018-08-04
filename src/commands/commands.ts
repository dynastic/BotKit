import { Collection, Message, RichEmbed, TextChannel } from 'discord.js';
import util from 'util';

import { COMMAND_PREFIX } from '../Constants';
import {CommandError} from './errors';
import { Argumented } from './guards';
import { AccessLevel, Command, Commands } from './util';

export const HelpCommand: Command = {
    opts: {
        name: "help",
        access: AccessLevel.EVERYONE,
        guards: [Argumented("help", "Provides help about all commands in this bot", [{name: "command", type: "string", required: false}])]
    },
    handler: async (message, next) => {
        const [specificCommand] = message.args;

        // command manpage
        if (specificCommand) {
            const command = message.app.commandSystem.commands[specificCommand];
            if (!command) {
                return next(new CommandError({message: "That command does not exist."}));
            }
            const metadata = message.app.commandSystem.metadata[command.opts.name];
            if (!metadata || (!metadata.description && !metadata.syntax)) {
                return next(new CommandError({message: "There's no additional help data for this command."}));
            }
            const {description, syntax} = metadata;
            const embed = new RichEmbed();
            embed.setTitle(`Information about \`${command.opts.name}\``);
            if (description) embed.addField("Description", description);
            if (syntax) embed.addField("Syntax", `\`${syntax}\``);
            await message.reply(embed);
            return;
        }

        const commands: {[category: string]: string[]} = {};
        const loadedCommands = message.app.commandSystem.commands;

        for (let commandName in loadedCommands) {
            if (!(await (message.member || message.author).hasAccess(commandName))) continue;
            const command = loadedCommands[commandName];
            if (!command) continue;
            const category = command.opts.category || "General";
            (commands[category] || (commands[category] = [])).push(`• \`${COMMAND_PREFIX}${command.opts.name}\``);
        }

        const helpEmbed = new RichEmbed();

        for (let category in commands) {
            const commandList = commands[category].join("\n");

            helpEmbed.addField(`${category}:`, commandList);
        }

        helpEmbed.setTitle("Available Commands");

        message.reply("", {embed: helpEmbed});
    }
};

export const PingCommand: Command = {
    opts: {
        name: "ping",
        category: "Diagnostics",
        access: AccessLevel.EVERYONE,
        guards: [Argumented("ping", "Calculates the latency between the bot and server", [])]
    },
    handler: async (message, next) => {
        const startTime = Date.now();

        const msg = await message.reply("Ping...") as Message;
        
        await msg.edit(`Ponged in ${msg.createdTimestamp - startTime}ms`);
    }
};

export const EvalCommand: Command = {
    opts: {
        name: "eval",
        category: "Diagnostics",
        access: AccessLevel.ROOT,
        guards: [Argumented("eval", "Evaluates the given code", [{name: "code", type: "string", required: true, unlimited: true}])]
    },
    handler: async (message, next) => {
        const context = {
            message,
            app: message.app,
            args: message.args,
            author: message.author,
            channel: message.channel,
            guild: message.guild,
            client: message.client
        };

        let res;
        try {
            res = eval(message.args.join(" "));
        } catch (e) {
            res = e;
        }

        const getResult = () => "Result\n```js\n" + util.inspect(res, false, 0) + "\n```";

        if (res instanceof Promise) {
            const response = await message.reply("Promise Pending...") as Message;
            try {
                res = await res;
            } catch (e) {
                res = e;
            }

            await response.edit(getResult());
            return;
        }

        await message.reply(getResult());
    }
};

export const Moderation: Commands = {
    opts: {
        access: AccessLevel.MODERATOR,
        category: "Moderation"
    },
    commands: [
        {
            opts: {
                name: "erase-channel",
                guards: [Argumented("erase-channel", "Erases all messages in the specified channel", [
                    {name: "channel", type: "channel"}
                ])]
            },
            handler: async (msg, next) => {
                let messages: Collection<string, Message>;
                while ((messages = await (msg.args[0] as any as TextChannel).fetchMessages({limit: 100})).size > 0) {
                    await msg.channel.bulkDelete(messages);
                }
                await msg.author.send(`I'm done cleaning <#${msg.channel.id}>`);
            }
        }
    ]
};

export const UnicodeEmoji: Command = {
    opts: {
        name: "unicode-emoji",
        guards: [
            Argumented(
                "unicode-emoji",
                "Sends the unicode version of the given emoji where applicable",
                [
                    {
                        name: "emoji",
                        type: "string"
                    }
                ]
            )
        ]
    },
    handler: msg => msg.reply(`\\${msg.args[0]}`)
}