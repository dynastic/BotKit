import { DBEntity } from "../../db";
export interface PermissionSet {
    grantedPermissions: string[];
    negatedPermissions: string[];
}
export declare class PermissionSetEntity extends DBEntity implements PermissionSet {
    guild: string;
    roles: string[];
    members: string[];
    grantedPermissions: string[];
    negatedPermissions: string[];
}
export declare type PermissionSetEntityStub = typeof PermissionSetEntity;
