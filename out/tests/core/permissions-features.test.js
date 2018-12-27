"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const util_1 = require("../../src/commands/permissions/util");
const chai_1 = require("chai");
describe("permissions api", () => {
    it("should properly create composite sets", () => {
        let sets;
        const [set1, set2] = sets = [util_1._PermissionInternals.generatePermissionSet(), util_1._PermissionInternals.generatePermissionSet()];
        const composite = util_1.PermissionsAPI.compositePermissionSet(sets);
        chai_1.assert(set1.grantedPermissions.every(perm => composite.grantedPermissions.indexOf(perm) > -1), `composite did not contain granted entry in set1`);
        chai_1.assert(set1.negatedPermissions.every(perm => composite.negatedPermissions.indexOf(perm) > -1), 'composite did not contain negated entry in set1');
        chai_1.assert(set2.grantedPermissions.every(perm => composite.grantedPermissions.indexOf(perm) > -1), 'composite did not contain granted entry in set2');
        chai_1.assert(set2.negatedPermissions.every(perm => composite.negatedPermissions.indexOf(perm) > -1), 'composite did not contain negated entry in set2');
    });
    it("should satisfy nodes with sets and composites", () => {
        let sets;
        const [set1, set2] = sets = [util_1._PermissionInternals.generatePermissionSet(), util_1._PermissionInternals.generatePermissionSet()];
        const negatedNode1 = set1.negatedPermissions[1] = set1.grantedPermissions[1];
        const negatedNode2 = set2.negatedPermissions[1] = set2.grantedPermissions[1];
        const [grantedNode1] = set1.grantedPermissions, [grantedNode2] = set2.grantedPermissions;
        const composite = util_1.PermissionsAPI.compositePermissionSet(sets);
        chai_1.assert(util_1.PermissionsAPI.nodeSatisfiesSet(grantedNode1, composite), `set1's granted permissions did not satisfy the composite`);
        chai_1.assert(util_1.PermissionsAPI.nodeSatisfiesSet(grantedNode2, composite), `set2's granted permissions did not satisfy the composite`);
        chai_1.assert(util_1.PermissionsAPI.nodeSatisfiesSet(negatedNode1, composite) === false, `set1's negated permissions are satisfying the composite. this should never happen.`);
        chai_1.assert(util_1.PermissionsAPI.nodeSatisfiesSet(negatedNode2, composite) === false, `set2's negated permissions are satisfying the composite. this should never happen.`);
    });
});
//# sourceMappingURL=permissions-features.test.js.map