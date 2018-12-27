import { DBEntity } from "../../db";

export interface PermissionSet {
    grantedPermissions: string[];
    negatedPermissions: string[];
}