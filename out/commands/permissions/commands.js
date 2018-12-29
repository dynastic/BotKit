"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Environment_1 = require("../guards/Environment");
const util_1 = require("util");
const guards_1 = require("../guards");
const util_2 = require("../util");
const errors_1 = require("../errors");
const PermissionsAccessLevel = util_2.AccessLevel.ADMIN;
const PermSetLoader = async (message, next) => {
    const [name] = message.args.map(r => r.toString());
    const guild = message.guild.id;
    const permSet = message.data.permSet = await message.client.botkit.options.permissionsEntity.findOne({ name: name.toString(), guild });
    if (!permSet) {
        return next(errors_1.CommandError.NOT_FOUND("No permission set with that name exists."));
    }
    next();
};
/**
 * Command builder for a membership target modifier
 * @param target role or member
 * @param state add or remove
 */
const TargetModifier = (target, state) => ({
    opts: {
        name: `${state}-${target}-pset`,
        node: "perm.manage-members",
        access: PermissionsAccessLevel,
        guards: [
            // ternary stuff in interpolation is for grammar
            guards_1.Argumented(`${state}-${target}-pset`, `${state === "add" ? "Add" : "Remove"} ${target}s ${state === "add" ? "to" : "from"} a permission set`, [
                {
                    type: "string",
                    name: "pset-name",
                    required: true
                },
                {
                    type: "string",
                    name: `${target}-ids`,
                    required: true,
                    unlimited: true
                }
            ]),
            PermSetLoader
        ]
    },
    handler: async (message, next) => {
        const [, ...ids] = message.args.map(i => i.toString());
        const permSet = message.data.permSet;
        // addTarget() or delTarget()
        permSet[state + "Target"](target, ...ids);
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
        access: PermissionsAccessLevel,
        guards: [
            // ternary stuff in interpolation is for grammar
            guards_1.Argumented(`${action}-perm`, `${action.capitalize()} a permission ${action === "negate" ? "from" : "in"} a permission set`, [
                {
                    type: "string",
                    name: "name",
                    required: true
                },
                {
                    type: "string",
                    name: "permissions",
                    required: true,
                    unlimited: true
                }
            ]),
            PermSetLoader
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
exports.PermissionsCommands = {
    opts: {
        guards: [Environment_1.EnvironmentGuard(['text'])]
    },
    commands: [
        {
            opts: {
                name: "create-pset",
                node: "perm.create-pset",
                access: PermissionsAccessLevel,
                guards: [
                    guards_1.Argumented("create-pset", "Create a permission set", [
                        {
                            type: "string",
                            name: "name",
                            required: true
                        }
                    ])
                ]
            },
            /**
             * Creates a bare permission set
             */
            handler: async (message, next) => {
                const [name] = message.args;
                const guild = message.guild.id;
                if (!(await message.client.botkit.options.permissionsEntity.isNameFree(name.toString(), guild))) {
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
                access: PermissionsAccessLevel,
                guards: [
                    guards_1.Argumented("get-pset", "Get a permission set", [
                        {
                            type: "string",
                            name: "name",
                            required: true
                        }
                    ]),
                    PermSetLoader
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
//# sourceMappingURL=commands.js.map