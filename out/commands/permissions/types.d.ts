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
    delTarget(target: "member" | "role", ...ids: string[]): any;
    addTarget(target: "member" | "role", ...ids: string[]): any;
    grant(node: string): any;
    negate(node: string): any;
    reset(node: string): any;
}
export declare type PermissionSetEntityStub = typeof PermissionSetEntity & {
    isNameFree(name: string, guild: string): Promise<Boolean>;
};
