"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts a node string to an array of its components
 * @param node the node stirng to collapse
 *
 * 'a.b.c.d.e' => ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e']
 */
const collapse = (node) => node.split('.').reduce((a, c) => {
    const base = typeof a[a.length - 1] === 'undefined' ? '' : `${a[a.length - 1]}.`;
    a.push(base + c);
    return a;
}, []);
/**
 * Determines whether a node satisfies another node
 * @param node the node to test
 * @param satisfyingNode the node to use in testing
 *
 * checks for wildcards and for literal matches
 */
function _nodesSatisfy(node, satisfyingNode) {
    if (node === satisfyingNode)
        return true;
    const collapsedNode = collapse(node);
    const collapsedSatisfying = collapse(satisfyingNode);
    // console.log(collapsedNode);
    // console.log(collapsedSatisfying);
    for (let i = 0; i < collapsedNode.length; i++) {
        if (collapsedSatisfying[i] === '*')
            return true;
        if (collapsedNode[i] !== collapsedSatisfying[i])
            return false;
    }
    return true;
}
console.log(_nodesSatisfy('a.b.c', '*'));
console.log(_nodesSatisfy('a.b.c', 'fty'));
console.log(_nodesSatisfy('a.b.c', 'a.*'));
console.log(_nodesSatisfy('a.b.c', 'a'));
console.log(_nodesSatisfy('a.b.c', 'a.b.*'));
console.log(_nodesSatisfy('a.b.c', 'a.b'));
console.log(_nodesSatisfy('a.b.c', 'a.b.c.*'));
console.log(_nodesSatisfy('a.b.c', 'a.b.c'));
function nodesSatisfy(node1, node2) {
    return _nodesSatisfy(node1, node2) || _nodesSatisfy(node2, node1);
}
exports.nodesSatisfy = nodesSatisfy;
//# sourceMappingURL=util.js.map