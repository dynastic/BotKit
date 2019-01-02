"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("../");
const commands_1 = require("../commands");
const guards_1 = require("../commands/guards");
const util_1 = require("../util");
const accessPriority = {
    EVERYONE: 0,
    MODERATOR: 1,
    ADMIN: 2,
    ROOT: 3,
    global: 0,
    moderator: 1,
    admin: 2,
    root: 3
};
function determineAccessLevel(id) {
    let access = __1.AccessLevel.EVERYONE;
    const ROLES_INCLUSIVE = util_1.calculateInclusiveRoles();
    const isRoot = ROLES_INCLUSIVE.root.includes(id);
    const isAdmin = ROLES_INCLUSIVE.admin.includes(id);
    const isMod = ROLES_INCLUSIVE.moderator.includes(id);
    if (isRoot)
        access = __1.AccessLevel.ROOT;
    else if (isAdmin && accessPriority[access] < accessPriority.ADMIN)
        access = __1.AccessLevel.ADMIN;
    else if (isMod && accessPriority[access] < accessPriority.MODERATOR)
        access = __1.AccessLevel.MODERATOR;
    return access;
}
const fallbackStr = (str1, str2) => str1.trim().length > 0 ? str1 : str2;
const createPermissionDepictionEmbed = (sets, target) => {
    let set;
    if (Array.isArray(sets)) {
        set = __1.PermissionsAPI.compositePermissionSet(sets);
    }
    else {
        set = sets[0];
    }
    let access = __1.AccessLevel.EVERYONE;
    if (target instanceof discord_js_1.Role) {
        access = determineAccessLevel(target.id);
    }
    else {
        const roleIDs = target.roles.map(role => role.id);
        roleIDs.forEach(id => {
            const accessLevel = determineAccessLevel(id);
            if (accessPriority[accessLevel] > accessPriority[access])
                access = accessLevel;
        });
    }
    if (access === 'global') {
        access = 'basic';
    }
    const embed = new discord_js_1.RichEmbed();
    embed.addField("Access Level", access.capitalize(), true);
    if (target instanceof discord_js_1.GuildMember) {
        const superuser = target.client.botkit.options.superuserCheck && target.client.botkit.options.superuserCheck(target.id);
        embed.addField("Superuser", !!superuser, true);
    }
    if (Array.isArray(sets)) {
        const setList = sets.map(subset => `\`${subset.name}\``).join("\n");
        embed.addField("Set List", fallbackStr(setList, "None"), false);
    }
    const grantList = set.grantedPermissions.map(perm => `\`${perm}\``).join("\n");
    const negateList = set.negatedPermissions.map(perm => `\`${perm}\``).join("\n");
    embed.addField("Granted Permissions", fallbackStr(grantList, "None"), true);
    embed.addField("Negated Permissions", fallbackStr(negateList, "None"), true);
    return embed;
};
const MemberRoleListGenerator = type => ({
    opts: {
        name: type === "members" ? "manulist" : `man${type[0].replace('m', 'u')}list`,
        node: "perm.read",
        usage: {
            description: `List all ${type === "members" ? "users" : type} in a set`,
            args: [
                {
                    type: "string",
                    name: "name",
                    required: true
                }
            ]
        },
        guards: [
            guards_1.PermSetLoader
        ]
    },
    handler: async (message) => {
        const permSet = message.data.permSet;
        const targetList = permSet[type].map(id => `<@${type === "roles" ? '&' : ''}${id}>`).join("\n");
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle("Permissions Query Report");
        embed.addField("Permission Set", `\`${permSet.name}\``, false);
        embed.addField(`${type === "members" ? "User" : type === "roles" ? "Role" : type.capitalize()} List`, fallbackStr(targetList, "None"), false);
        await message.reply(embed);
    }
});
const PermissionStateGenerator = action => ({
    opts: {
        name: `manp${action}`,
        node: "perm.write",
        usage: {
            description: "Updates the status of a permission in a permission set",
            args: [
                {
                    type: "string",
                    name: "permission-set",
                    required: true
                },
                {
                    type: "string",
                    name: "permissions",
                    required: true,
                    unlimited: true
                }
            ]
        },
        guards: [
            guards_1.PermSetLoader
        ]
    },
    handler: async (message) => {
        const [, ...permissions] = message.args;
        const { permSet } = message.data;
        console.log(permissions);
        permissions.forEach(permission => {
            let targetNegated = false;
            if (permission.startsWith("-") || permission.startsWith("!")) {
                targetNegated = true;
                permission = permission.substring(1);
            }
            if (action === "add") {
                if (targetNegated) {
                    permSet.negate(permission);
                }
                else {
                    permSet.grant(permission);
                }
            }
            else {
                if (targetNegated) {
                    permSet.negatedPermissions.remove(permission);
                }
                else {
                    permSet.grantedPermissions.remove(permission);
                }
            }
        });
        await permSet.save();
        await message.success();
    }
});
const membershipStateGenerator = (type, mode) => ({
    opts: {
        // manuadd
        // manudel
        // manradd
        // manrdel
        name: `man${type[0].replace('m', 'u')}${mode}`,
        node: "perm.write",
        usage: {
            description: `${mode.capitalize().replace("Del", "Remove")} a ${type} ${mode === "add" ? "to" : "from"} a permission set`,
            args: [
                {
                    type: "string",
                    name: "name",
                    required: true
                },
                {
                    type,
                    name: type,
                    required: true,
                    unlimited: true
                }
            ]
        },
        guards: [
            guards_1.PermSetLoader
        ]
    },
    handler: async (message) => {
        let ids = message.args.slice(1);
        ids = ids.filter((id) => id !== null && id.id);
        const { permSet } = message.data;
        await Promise.all(ids.map(({ id }) => permSet[mode + "Target"](type, id)));
        await permSet.save();
        await message.success();
    }
});
exports.GroupManager = {
    opts: {
        access: __1.AccessLevel.ADMIN,
        category: "Group Manager",
        guards: [
            guards_1.EnvironmentGuard(['text'])
        ]
    },
    commands: [
        {
            opts: {
                name: "mansget",
                node: "perm.read",
                usage: {
                    description: "Get a permission set",
                    args: [
                        {
                            type: "string",
                            name: "name",
                            required: true
                        }
                    ]
                },
                guards: [
                    guards_1.PermSetLoader
                ]
            },
            handler: async (message, next) => {
                const permSet = message.data.permSet;
                const embed = new discord_js_1.RichEmbed();
                embed.addField("Name", permSet.name, false);
                embed.addField("Roles", fallbackStr(permSet.roles.map(id => `<@&${id}>`).join("\n"), "None"), true);
                embed.addField("Members", fallbackStr(permSet.members.map(id => `<@${id}>`).join("\n"), "None"), true);
                embed.addField("Granted Permissions", fallbackStr(permSet.grantedPermissions.map(perm => `\`${perm}\``).join("\n"), "None"), false);
                embed.addField("Negated Permissions", fallbackStr(permSet.negatedPermissions.map(perm => `\`${perm}\``).join("\n"), "None"), false);
                await message.reply(embed);
            }
        },
        {
            opts: {
                name: "mansadd",
                node: "perm.write",
                usage: {
                    description: "Add a permission set",
                    args: [
                        {
                            type: "string",
                            name: "name",
                            required: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const [name] = message.args;
                await message.client.botkit.options.permissionsEntity.create({
                    name,
                    guild: message.guild.id,
                    roles: [],
                    members: [],
                    grantedPermissions: [],
                    negatedPermissions: []
                });
                const reply = await commands_1.CommandUtils.runCommand(message, `mansget ${name}`);
                if (reply.reply) {
                    await message.reply(...reply.reply);
                }
                else {
                    return next(new __1.CommandError({
                        message: "An error occurred while making the permission set.",
                        title: "Unknown Error"
                    }));
                }
            }
        },
        {
            opts: {
                name: "manslist",
                node: "perm.read"
            },
            handler: async (message, next) => {
                const sets = await message.client.botkit.options.permissionsEntity.find({ guild: message.guild.id });
                const setList = sets.map(set => `\`${set.name}\``).sort().join("\n");
                const embed = new discord_js_1.RichEmbed();
                embed.addField("Guild", `${message.guild.name} (${message.guild.id})`);
                embed.addField("Permission Sets", fallbackStr(setList, "None"));
                embed.setTitle("Permission Set Overview");
                await message.reply(embed);
            }
        },
        {
            opts: {
                name: "mansdel",
                node: "perm.write",
                usage: {
                    description: "Delete a permission set",
                    args: [
                        {
                            type: "string",
                            name: "names",
                            required: true,
                            unlimited: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const permSetNames = message.args;
                await Promise.all(permSetNames.map(name => message.client.botkit.options.permissionsEntity.findOne({ name, guild: message.guild.id })).map(permSet => permSet.then(set => set && set.remove())));
                await message.success();
            }
        },
        {
            opts: {
                name: "manuget",
                node: "perm.read",
                usage: {
                    description: "Get information on a user's permissions",
                    args: [
                        {
                            type: "member",
                            name: "user to get",
                            required: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const [member] = message.args;
                const sets = await message.client.botkit.options.permissionsEntity.createQueryBuilder()
                    .where("members @> :member", { member: [member.id] })
                    .andWhere("guild = :guild", { guild: message.guild.id })
                    .getMany();
                const embed = createPermissionDepictionEmbed(sets, member);
                embed.setTitle("Member Permissions Profile");
                await message.reply(embed);
            }
        },
        // manulist
        MemberRoleListGenerator("members"),
        // manrlist
        MemberRoleListGenerator("roles"),
        {
            opts: {
                name: "manrget",
                node: "perm.read",
                usage: {
                    description: "Get information on a role's permissions",
                    args: [
                        {
                            type: "role",
                            name: "role to get",
                            required: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const [role] = message.args;
                const sets = await message.client.botkit.options.permissionsEntity.createQueryBuilder()
                    .where("roles @> :roles", { roles: [role.id] })
                    .getMany();
                const embed = createPermissionDepictionEmbed(sets, role);
                embed.setTitle("Role Permissions Profile");
                await message.reply(embed);
            }
        },
        // manuadd
        membershipStateGenerator("member", "add"),
        // manudel
        membershipStateGenerator("member", "del"),
        // manradd
        membershipStateGenerator("role", "add"),
        // manrdel
        membershipStateGenerator("role", "del"),
        // manpadd
        PermissionStateGenerator("add"),
        // manpdel
        PermissionStateGenerator("del")
    ]
};
//# sourceMappingURL=group-manager.js.map