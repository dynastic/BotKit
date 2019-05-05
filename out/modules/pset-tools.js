"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const errors_1 = require("../commands/errors");
const guards_1 = require("../commands/guards");
/**
 * Command builder for a membership target modifier
 * @param target role or member
 * @param state add or remove
 */
const TargetModifier = (target, state) => ({
    opts: {
        name: `${state}-${target}-pset`,
        node: "perm.manage-members",
        usage: {
            // ternary stuff in interpolation is for grammar
            description: `${state === "add" ? "Add" : "Remove"} ${target}s ${state === "add" ? "to" : "from"} a permission set`,
            args: [
                {
                    type: "string",
                    name: "pset-name",
                    description: "The set to look up",
                    required: true
                },
                {
                    type: target === "member" ? "member" : "string",
                    name: `${target}-ids`,
                    description: "The targets to add/remove",
                    required: true,
                    unlimited: true
                }
            ]
        },
        guards: [
            guards_1.PermSetLoader
        ]
    },
    handler: async (message, next) => {
        const [, ...ids] = message.args;
        const permSet = message.data.permSet;
        // addTarget() or delTarget()
        permSet[state + "Target"](target, ...(typeof ids[0] === "string" ? ids : ids.map(member => member.id)));
        await permSet.save();
        await message.success();
        next();
    }
});
/**
 * Command builder for a permission state modifier
 * @param action the permission action
 */
const PermissionStateModifier = action => ({
    opts: {
        name: `${action}-perm`,
        node: "perm.manage-perm",
        usage: {
            // ternary stuff in interpolation is for grammar
            description: `${action.capitalize()} a permission ${action === "negate" ? "from" : "in"} a permission set`,
            args: [
                {
                    type: "string",
                    name: "name",
                    description: "The set to modify",
                    required: true
                },
                {
                    type: "string",
                    name: "permissions",
                    description: "The permissions to set",
                    required: true,
                    unlimited: true
                }
            ]
        },
        guards: [
            guards_1.PermSetLoader
        ]
    },
    handler: async (message, next) => {
        const [, ...permissions] = message.args.map(p => p.toString());
        const permSet = message.data.permSet;
        // calls permSet.grant(), permSet.negate(), permSet.reset() depending on action variable
        permissions.forEach(permission => permSet[action](permission));
        await permSet.save();
        await message.success();
    }
});
exports.PsetTools = {
    opts: {
        environments: ['text'],
        category: "Permissions"
    },
    commands: [
        {
            opts: {
                name: "create-pset",
                node: "perm.create-pset",
                usage: {
                    description: "Create a permission set",
                    args: [
                        {
                            type: "string",
                            name: "name",
                            description: "The name of the set being created",
                            required: true
                        }
                    ]
                }
            },
            /**
             * Creates a bare permission set
             */
            handler: async (message, next) => {
                const [name] = message.args;
                const guild = message.guild.id;
                const entity = await message.client.botkit.options.permissionsEntity.findOne({ name, guild });
                if (entity) {
                    return next(new errors_1.CommandError({
                        title: "Name Unavailable",
                        message: `The name \`${name}\` is already taken. Please choose another name.`
                    }));
                }
                const permSet = await message.client.botkit.options.permissionsEntity.create({
                    guild,
                    name: name.toString(),
                    roles: [],
                    members: [],
                    grantedPermissions: [],
                    negatedPermissions: []
                });
                const id = await permSet.save().then(set => set.id);
                await message.reply(`Permission set created. Name: \`${name}\``);
                next();
            }
        },
        {
            opts: {
                name: "get-pset",
                node: "perm.get-pset",
                usage: {
                    description: "Get a permission set",
                    args: [
                        {
                            type: "string",
                            name: "name",
                            description: "The set to look up",
                            required: true
                        }
                    ]
                },
                guards: [
                    guards_1.PermSetLoader
                ]
            },
            /**
             * Returns a raw util.inspect() of the permission set
             */
            handler: async (message, next) => {
                const permSet = message.data.permSet;
                const description = util_1.inspect(permSet.json, false, 1);
                await message.reply(`\`\`\`js\n${description}\n\`\`\``);
                next();
            }
        },
        TargetModifier("role", "add"),
        TargetModifier("role", "del"),
        TargetModifier("member", "add"),
        TargetModifier("member", "del"),
        PermissionStateModifier("grant"),
        PermissionStateModifier("negate"),
        PermissionStateModifier("reset")
    ]
};
//# sourceMappingURL=pset-tools.js.map