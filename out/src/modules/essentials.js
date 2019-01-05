"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("../commands");
exports.Essentials = {
    opts: {
        category: "Essentials"
    },
    commands: [
        {
            opts: {
                name: "sudo",
                node: "su.sudo",
                usage: {
                    description: "Perform commands on the behalf of another member",
                    args: [
                        {
                            type: "member",
                            name: "target",
                            description: "The person to act on the behalf of",
                            required: true
                        },
                        {
                            type: "string",
                            name: "command",
                            description: "The command to run",
                            required: true,
                            unlimited: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const [member] = message.args;
                const command = message.args.slice(1).join(" ");
                const result = await commands_1.CommandUtils.runCommand(message, command, member.user);
                if (result.reply) {
                    await message.reply(...result.reply);
                }
                else if (result.error) {
                    return next(result.error);
                }
                if (result.pinned) {
                    await message.react('📌');
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
};
//# sourceMappingURL=essentials.js.map