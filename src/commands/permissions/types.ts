import { DBEntity } from "../../db";

export interface PermissionSet {
    grantedPermissions: string[];
    negatedPermissions: string[];
}

export declare class PermissionSetEntity extends DBEntity implements PermissionSet {
    guild: string;
    name: string;
    roles: string[];
    members: string[];
    grantedPermissions: string[];
    negatedPermissions: string[];

    json: {
        guild: string;
        name: string;
        roles: string[];
        members: string[];
        grantedPermissions: string[];
        negatedPermissions: string[];
    };

    delTarget(target: "member" | "role", ...ids: string[]);
    addTarget(target: "member" | "role", ...ids: string[]);
    grant(node: string);
    negate(node: string);
    reset(node: string);
}

export type PermissionSetEntityStub = typeof PermissionSetEntity;