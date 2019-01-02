import { GuildMember } from "discord.js";
import { AccessLevel, Commands } from "..";
import { CommandUtils } from "../commands";

export const Essentials: Commands = {
    opts: {
        category: "Essentials"
    },
    commands: [
        {
            opts: {
                name: "sudo",
                node: "su.sudo",
                access: AccessLevel.ROOT,
                usage: {
                    description: "Perform commands on the behalf of another member",
                    args: [
                        {
                            type: "member",
                            name: "target",
                            required: true
                        },
                        {
                            type: "string",
                            name: "command",
                            required: true,
                            unlimited: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const [ member ] = message.args as GuildMember[];
                const command = (message.args as string[]).slice(1).join(" ");

                const result = await CommandUtils.runCommand(message, command, member.user);

                if (result.reply) {
                    await message.reply(...result.reply);
                } else if (result.error) {
                    return next(result.error);
                }
                if (result.pinned) {
                    await message.react('📌')
                }
                if (result.warning) {
                    await message.warning();
                }
                if (result.completed) {
                    await message.success();
                }
                if (result.deleted) {
                    await message.react('🗑');
                }
            }
        }
    ]
}