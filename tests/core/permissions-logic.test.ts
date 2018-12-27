import 'mocha';

import chai, { expect, assert } from 'chai';
import { PermissionsAPI, _PermissionInternals } from '../../src/commands/permissions/util';

const {nodesSatisfy} = PermissionsAPI;
const {segmentNode} = PermissionsAPI.Utils;

describe("satisfying nodes", () => {
    it("should accept wildcards at any level", () => {
        const sampleNode = _PermissionInternals.generateNode(3);
        const nodeSegments = segmentNode(sampleNode);
        const wildcards = nodeSegments.slice(0, nodeSegments.length - 1).map(node => node + ".*");
        
        wildcards.forEach(wildcard => assert(nodesSatisfy(sampleNode, wildcard), `${wildcard} should've satisfied ${sampleNode}, but doesn't`));
    });

    it("should reject wildcards that are below the node", () => {
        const sampleNode = _PermissionInternals.generateNode(3);
        const wildcardNode = sampleNode + ".*";

        assert(!nodesSatisfy(sampleNode, wildcardNode), `${wildcardNode} should not have satisfied ${sampleNode}, but it does`);
    });

    it("should reject inequal nodes", () => {
        const nodes = _PermissionInternals.generateNodePairs(50, 3);

        nodes.forEach(([node1, node2]) => assert(!nodesSatisfy(node1, node2), `${node1} should not have satisfied ${node2}, but it does`));
    });

    it("should accept equal nodes", () => {
        const node1 = _PermissionInternals.generateNode(3);

        assert(nodesSatisfy(node1, node1), `${node1} should have satisfied itself (${node1}), but it doesn't`)
    });

    it("should not accept higher-level nodes without a wildcard (a.b NOT SATISFY a.b.c)", () => {
        const node1 = _PermissionInternals.generateNode(3);
        const node2 = node1 + "." + _PermissionInternals.generateNode(3);

        assert(!nodesSatisfy(node1, node2), `${node1} should not have satisfied ${node2}, but it does`);
    });
});