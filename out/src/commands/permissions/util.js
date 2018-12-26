"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _PermissionInternals;
(function (_PermissionInternals) {
    /**
     * Determines whether a node satisfies another node
     * @param node the node to test
     * @param satisfyingNode the node to use in testing
     *
     * checks for wildcards and for literal matches
     */
    function nodesSatisfy(node, satisfyingNode) {
        if (node === satisfyingNode)
            return true;
        const nodeSegments = node.split('.');
        ;
        const satisfyingSegments = satisfyingNode.split('.');
        for (let i = 0; i < nodeSegments.length; i++) {
            if (satisfyingSegments[i] === '*')
                return true;
            if (nodeSegments[i] !== satisfyingSegments[i])
                break;
        }
        return false;
    }
    _PermissionInternals.nodesSatisfy = nodesSatisfy;
})(_PermissionInternals = exports._PermissionInternals || (exports._PermissionInternals = {}));
/**
 * Determines whether two nodes satisfy eachother
 * @param node1 the first node to compare
 * @param node2 the second node to compare
 *
 * "Node" is a fancy term for a permission string. Each node represents a command or a group of commands to be locked behind the same permission
 *
 * Nodes may be satisfied by wildcards at any level of the node except the end.
 * ex:
 *
 * Node: a.b.c.d.e
 * Tests:
 * - *: satisfy
 * - a.*: satisfy
 * - a.b.*: satisfy
 * - a.b.c.d.e.*: not satisfy
 *
 * Nodes may be satisfied by an identical node
 * Node: a.b.c.d.e
 * Tests:
 * - a.b.c.d.e: satisfy
 * - anything.else: not satisfy
 *
 * @returns whether the nodes are satisfied :)
 */
function nodesSatisfy(node1, node2) {
    return _PermissionInternals.nodesSatisfy(node1, node2) || _PermissionInternals.nodesSatisfy(node2, node1);
}
exports.nodesSatisfy = nodesSatisfy;
/**
 * Converts a node string to an array of its components
 * @param node the node stirng to collapse
 *
 * @returns 'a.b.c.d.e' => ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e']
 */
exports.segmentNode = (node) => node.split('.').reduce((a, c) => {
    const base = typeof a[a.length - 1] === 'undefined' ? '' : `${a[a.length - 1]}.`;
    a.push(base + c);
    return a;
}, []);
//# sourceMappingURL=util.js.map