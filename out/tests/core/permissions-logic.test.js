"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const util_1 = require("../../src/commands/permissions/util");
function generateNode(length = 3) {
    const generateSegment = () => Math.random().toString(36).replace('0.', '').substring(0, 4);
    const segments = [];
    for (let i = 0; i < length; i++)
        segments.push(generateSegment());
    return segments.join(".");
}
function generateNodes(number = 2, length) {
    const nodes = [];
    for (let i = 0; i < number; i++)
        nodes.push(generateNode(length));
    return nodes;
}
function generateNodePairs(number = 2, length, identical = false) {
    const nodePairs = [];
    for (let i = 0; i < number; i++)
        nodePairs.push(identical ? generateNodes(2, length).map((_, i, a) => a[0]) : generateNodes(2, length));
    return nodePairs;
}
describe("satisfying nodes", () => {
    it("should accept wildcards at any level", () => {
        const sampleNode = generateNode(3);
        const nodeSegments = util_1.segmentNode(sampleNode);
        const wildcards = nodeSegments.slice(0, nodeSegments.length - 1).map(node => node + ".*");
        wildcards.forEach(wildcard => chai_1.assert(util_1.nodesSatisfy(sampleNode, wildcard), `${wildcard} should've satisfied ${sampleNode}, but doesn't`));
    });
    it("should reject wildcards that are below the node", () => {
        const sampleNode = generateNode(3);
        const wildcardNode = sampleNode + ".*";
        chai_1.assert(!util_1.nodesSatisfy(sampleNode, wildcardNode), `${wildcardNode} should not have satisfied ${sampleNode}, but it does`);
    });
    it("should reject inequal nodes", () => {
        const nodes = generateNodePairs(50, 3);
        nodes.forEach(([node1, node2]) => chai_1.assert(!util_1.nodesSatisfy(node1, node2), `${node1} should not have satisfied ${node2}, but it does`));
    });
    it("should accept equal nodes", () => {
        const node1 = generateNode(3);
        chai_1.assert(util_1.nodesSatisfy(node1, node1), `${node1} should have satisfied itself (${node1}), but it doesn't`);
    });
    it("should not accept higher-level nodes without a wildcard (a.b NOT SATISFY a.b.c)", () => {
        const node1 = generateNode(3);
        const node2 = node1 + "." + generateNode(3);
        chai_1.assert(!util_1.nodesSatisfy(node1, node2), `${node1} should not have satisfied ${node2}, but it does`);
    });
});
//# sourceMappingURL=permissions-logic.test.js.map