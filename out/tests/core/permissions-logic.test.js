"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const util_1 = require("../../src/commands/permissions/util");
const { nodesSatisfy } = util_1.PermissionsAPI;
const { segmentNode } = util_1.PermissionsAPI.Utils;
describe("satisfying nodes", () => {
    it("should accept wildcards at any level", () => {
        const sampleNode = util_1._PermissionInternals.generateNode(3);
        const nodeSegments = segmentNode(sampleNode);
        const wildcards = nodeSegments.slice(0, nodeSegments.length - 1).map(node => node + ".*");
        wildcards.forEach(wildcard => chai_1.assert(nodesSatisfy(sampleNode, wildcard), `${wildcard} should've satisfied ${sampleNode}, but doesn't`));
    });
    it("should reject wildcards that are below the node", () => {
        const sampleNode = util_1._PermissionInternals.generateNode(3);
        const wildcardNode = sampleNode + ".*";
        chai_1.assert(!nodesSatisfy(sampleNode, wildcardNode), `${wildcardNode} should not have satisfied ${sampleNode}, but it does`);
    });
    it("should reject inequal nodes", () => {
        const nodes = util_1._PermissionInternals.generateNodePairs(50, 3);
        nodes.forEach(([node1, node2]) => chai_1.assert(!nodesSatisfy(node1, node2), `${node1} should not have satisfied ${node2}, but it does`));
    });
    it("should accept equal nodes", () => {
        const node1 = util_1._PermissionInternals.generateNode(3);
        chai_1.assert(nodesSatisfy(node1, node1), `${node1} should have satisfied itself (${node1}), but it doesn't`);
    });
    it("should not accept higher-level nodes without a wildcard (a.b NOT SATISFY a.b.c)", () => {
        const node1 = util_1._PermissionInternals.generateNode(3);
        const node2 = node1 + "." + util_1._PermissionInternals.generateNode(3);
        chai_1.assert(!nodesSatisfy(node1, node2), `${node1} should not have satisfied ${node2}, but it does`);
    });
});
//# sourceMappingURL=permissions-logic.test.js.map