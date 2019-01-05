import { GuildMember, RichEmbed, Role } from "discord.js";
import { Command, CommandError, Commands, PermissionsAPI, PermissionSet, PermissionSetEntity } from "..";
import { CommandUtils } from "../commands";
import { PermSetLoader } from "../commands/guards";

interface PermSetContainer { permSet: PermissionSetEntity }

const fallbackStr = (str1: string, str2: string) => str1.trim().length > 0 ? str1 : str2;

const createPermissionDepictionEmbed = (sets: PermissionSetEntity | PermissionSetEntity[], target: Role | GuildMember) => {
    let set: PermissionSet;

    if (Array.isArray(sets)) {
        set = PermissionsAPI.compositePermissionSet(sets);
    } else {
        set = sets[0];
    }

    const embed = new RichEmbed();

    if (target instanceof GuildMember) {
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
}

const MemberRoleListGenerator: (type: "members" | "roles") => Command = type => ({
    opts: {
        name: `get-${type}`,
        node: "perm.read",
        usage: {
            description: `List all ${type === "members" ? "users" : type} in a set`,
            args: [
                {
                    type: "string",
                    description: `The set to look up`,
                    name: "name",
                    required: true
                }
            ]
        },
        guards: [
            PermSetLoader
        ]
    },
    handler: async message => {
        const permSet: PermissionSetEntity = message.data.permSet;

        const targetList = permSet[type].map(id => `<@${type === "roles" ? '&' : ''}${id}>`).join("\n");

        const embed = new RichEmbed();
        embed.setTitle("Permissions Query Report");
        embed.addField("Permission Set", `\`${permSet.name}\``, false);
        embed.addField(`${type === "members" ? "User" : type === "roles" ? "Role" : (type as string).capitalize()} List`, fallbackStr(targetList, "None"), false);

        await message.reply(embed);
    }
});

const PermissionStateGenerator: (action: "add" | "del") => Command = action => ({
    opts: {
        name: `${action}-permission`,
        node: "perm.write",
        usage: {
            description: "Updates the status of a permission in a permission set",
            args: [
                {
                    type: "string",
                    name: "permission-set",
                    description: "The permission set to look up",
                    required: true
                },
                {
                    type: "string",
                    name: "permissions",
                    description: "The permissions to alter",
                    required: true,
                    unlimited: true
                }
            ]
        },
        guards: [
            PermSetLoader
        ]
    },
    handler: async message => {
        const [, ...permissions] = message.args as string[];

        const { permSet } = message.data as PermSetContainer;

        console.log(permissions);

        permissions.forEach(permission => {
            let targetNegated: boolean = false;

            if (permission.startsWith("-") || permission.startsWith("!")) {
                targetNegated = true;
                permission = permission.substring(1);
            }

            if (action === "add") {
                if (targetNegated) {
                    permSet.negate(permission);
                } else {
                    permSet.grant(permission);
                }
            } else {
                if (targetNegated) {
                    permSet.negatedPermissions.remove(permission);
                } else {
                    permSet.grantedPermissions.remove(permission);
                }
            }
        });

        await permSet.save();
        await message.success();
    }
})

const membershipStateGenerator: (type: "member" | "role", mode: "add" | "del") => Command = (type, mode) => ({
    opts: {
        // manuadd
        // manudel
        // manradd
        // manrdel
        name: `${mode}-${type}`,
        node: "perm.write",
        usage: {
            description: `${mode.capitalize().replace("Del", "Remove")} a ${type} ${mode === "add" ? "to" : "from"} a permission set`,
            args: [
                {
                    type: "string",
                    name: "name",
                    description: "The permission set to modify",
                    required: true
                },
                {
                    type,
                    name: type,
                    description: "The targets to assign sets to",
                    required: true,
                    unlimited: true
                }
            ]
        },
        guards: [
            PermSetLoader
        ]
    },
    handler: async (message) => {
        let ids = message.args.slice(1) as Array<GuildMember | Role>;
        ids = ids.filter((id: null | { id: string }) => id !== null && id.id);
        const { permSet } = message.data as PermSetContainer;

        await Promise.all(ids.map(({ id }) => permSet[mode + "Target"](type, id)));

        await permSet.save();

        await message.success();
    }
})

export const SetManager: Commands = {
    opts: {
        category: "Set Manager",
        environments: ['text']
    },
    commands: [
        {
            opts: {
                name: "get-set",
                node: "perm.read",
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
                    PermSetLoader
                ]
            },
            handler: async (message, next) => {
                const permSet: PermissionSetEntity = message.data.permSet;

                const embed = new RichEmbed();
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
                name: "add-set",
                node: "perm.write",
                usage: {
                    description: "Add a permission set",
                    args: [
                        {
                            type: "string",
                            name: "name",
                            description: "The name of the set you're creating",
                            required: true
                        }
                    ]
                },
                guards: [
                    PermSetLoader
                ]
            },
            handler: async (message, next) => {
                const [name] = message.args as string[];

                const { permSet } = message.data as PermSetContainer;

                if (permSet) {
                    return next(new CommandError({
                        message: "A permission set already exists with that name. Please choose another one or delete that permission set.",
                        title: "Naming Conflict"
                    }))
                }

                await message.client.botkit.options.permissionsEntity!.create({
                    name,
                    guild: message.guild.id,
                    roles: [],
                    members: [],
                    grantedPermissions: [],
                    negatedPermissions: []
                })

                // depict the permission set we just made
                const reply = await CommandUtils.runCommand(message, `mansget ${name}`);

                if (reply.reply) {
                    await message.reply(...reply.reply);
                } else {
                    return next(new CommandError({
                        message: "An error occurred while making the permission set.",
                        title: "Unknown Error"
                    }));
                }
            }
        },
        {
            opts: {
                name: "list-sets",
                node: "perm.read"
            },
            handler: async (message, next) => {
                const sets = await message.client.botkit.options.permissionsEntity!.find({ guild: message.guild.id });

                const setList = sets.map(set => `\`${set.name}\``).sort().join("\n");

                const embed = new RichEmbed();

                embed.addField("Guild", `${message.guild.name} (${message.guild.id})`);
                embed.addField("Permission Sets", fallbackStr(setList, "None"));
                embed.setTitle("Permission Set Overview");

                await message.reply(embed);
            }
        },
        {
            opts: {
                name: "del-set",
                node: "perm.write",
                usage: {
                    description: "Delete a permission set",
                    args: [
                        {
                            type: "string",
                            name: "names",
                            description: "The set ot delete",
                            required: true,
                            unlimited: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const permSetNames = message.args as string[];
                
                await Promise.all(permSetNames.map(name => message.client.botkit.options.permissionsEntity!.findOne({name, guild: message.guild.id})).map(permSet => permSet.then(set => set as any && set!.remove())));

                await message.success();
            }
        },
        {
            opts: {
                name: "get-member",
                node: "perm.read",
                usage: {
                    description: "Get information on a member's permissions",
                    args: [
                        {
                            type: "member",
                            name: "member to get",
                            description: "The member to look up",
                            required: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const [member] = message.args as GuildMember[];

                const sets = await message.client.botkit.options.permissionsEntity!.createQueryBuilder()
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
                name: "get-role",
                node: "perm.read",
                usage: {
                    description: "Get information on a role's permissions",
                    args: [
                        {
                            type: "role",
                            name: "role",
                            description: "The role to look up",
                            required: true
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const [role] = message.args as Role[];

                const sets = await message.client.botkit.options.permissionsEntity!.createQueryBuilder()
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
}