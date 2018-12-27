import 'mocha';

import { PermissionSet } from "../../src/commands/permissions/types";
import { _PermissionInternals, PermissionsAPI } from "../../src/commands/permissions/util";

import chai, { expect, assert } from 'chai';

describe("permissions api", () => {
    it("should properly create composite sets", () => {
        let sets;
        const [set1, set2] = sets = [_PermissionInternals.generatePermissionSet(), _PermissionInternals.generatePermissionSet()];

        const composite = PermissionsAPI.compositePermissionSet(sets);

        assert(set1.grantedPermissions.every(perm => composite.grantedPermissions.indexOf(perm) > -1), `composite did not contain granted entry in set1`);
        assert(set1.negatedPermissions.every(perm => composite.negatedPermissions.indexOf(perm) > -1), 'composite did not contain negated entry in set1');
        assert(set2.grantedPermissions.every(perm => composite.grantedPermissions.indexOf(perm) > -1), 'composite did not contain granted entry in set2');
        assert(set2.negatedPermissions.every(perm => composite.negatedPermissions.indexOf(perm) > -1), 'composite did not contain negated entry in set2');
    });

    it("should satisfy nodes with sets and composites", () => {
        let sets;
        const [set1, set2] = sets = [_PermissionInternals.generatePermissionSet(), _PermissionInternals.generatePermissionSet()];

        const negatedNode1 = set1.negatedPermissions[1] = set1.grantedPermissions[1];
        const negatedNode2 = set2.negatedPermissions[1] = set2.grantedPermissions[1];

        const [grantedNode1] = set1.grantedPermissions, [grantedNode2] = set2.grantedPermissions;

        const composite = PermissionsAPI.compositePermissionSet(sets);

        assert(PermissionsAPI.nodeSatisfiesSet(grantedNode1, composite), `set1's granted permissions did not satisfy the composite`);
        assert(PermissionsAPI.nodeSatisfiesSet(grantedNode2, composite), `set2's granted permissions did not satisfy the composite`);
        assert(PermissionsAPI.nodeSatisfiesSet(negatedNode1, composite) === false, `set1's negated permissions are satisfying the composite. this should never happen.`);
        assert(PermissionsAPI.nodeSatisfiesSet(negatedNode2, composite) === false, `set2's negated permissions are satisfying the composite. this should never happen.`);
    });
});