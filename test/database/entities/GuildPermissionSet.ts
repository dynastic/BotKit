import { DBEntity, PermissionSetEntity } from "../../../src";
import { Entity, Column } from "typeorm";

@Entity()
export class GuildPermissionSet extends DBEntity implements PermissionSetEntity {
    @Column()
    guild: string;

    @Column()
    name: string;

    @Column("text", { array: true })
    roles: string[];

    @Column("text", { array: true })
    members: string[];

    @Column("text", { array: true })
    grantedPermissions: string[];

    @Column("text", { array: true })
    negatedPermissions: string[];

    get json() {
        return {
            guild: this.guild,
            name: this.name,
            roles: this.roles,
            members: this.members,
            grantedPermissions: this.grantedPermissions,
            negatedPermissions: this.negatedPermissions
        };
    }
    
    delTarget(target: "member" | "role", ...ids: string[]) {
        ids.forEach(id => this[target + "s"].remove(id));
    }

    addTarget(target: "member" | "role", ...ids: string[]) {
        ids = ids.filter(id => !!id);
        this[target + "s"] = this[target + "s"].concat(ids);
    }

    /**
     * Grant a permission to the set, automatically un-negating it if it is negated.
     * @param node the node to grant
     */
    public grant(node: string) {
        if (!node) return;

        if (this.negatedPermissions.includes(node)) {
            this.negatedPermissions.remove(node);
        }

        if (!this.grantedPermissions.includes(node)) {
            this.grantedPermissions.push(node);
        }
    }

    /**
     * Negate a permission from the set, automatically un-granting it if it is granted.
     * @param node the node to negate
     */
    public negate(node: string) {
        if (!node) return;

        if (this.grantedPermissions.includes(node)) {
            this.grantedPermissions.remove(node);
        }

        if (!this.negatedPermissions.includes(node)) {
            this.negatedPermissions.push(node);
        }
    }

    /**
     * Reset a permission in the set
     * @param node the node to reset
     */
    public reset(node: string) {
        this.grantedPermissions.remove(node);
        this.negatedPermissions.remove(node);
    }
}