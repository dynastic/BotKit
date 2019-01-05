import { DBEntity, PermissionSetEntity } from "../../../src";
export declare class GuildPermissionSet extends DBEntity implements PermissionSetEntity {
    guild: string;
    name: string;
    roles: string[];
    members: string[];
    grantedPermissions: string[];
    negatedPermissions: string[];
    readonly json: {
        guild: string;
        name: string;
        roles: string[];
        members: string[];
        grantedPermissions: string[];
        negatedPermissions: string[];
    };
    delTarget(target: "member" | "role", ...ids: string[]): void;
    addTarget(target: "member" | "role", ...ids: string[]): void;
    /**
     * Grant a permission to the set, automatically un-negating it if it is negated.
     * @param node the node to grant
     */
    grant(node: string): void;
    /**
     * Negate a permission from the set, automatically un-granting it if it is granted.
     * @param node the node to negate
     */
    negate(node: string): void;
    /**
     * Reset a permission in the set
     * @param node the node to reset
     */
    reset(node: string): void;
}
