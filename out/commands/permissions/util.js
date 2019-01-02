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
    function generateNode(length = 3) {
        const generateSegment = () => Math.random().toString(36).replace('0.', '').substring(0, 4);
        const segments = [];
        for (let i = 0; i < length; i++)
            segments.push(generateSegment());
        return segments.join(".");
    }
    _PermissionInternals.generateNode = generateNode;
    function generateNodes(number = 2, length) {
        const nodes = [];
        for (let i = 0; i < number; i++)
            nodes.push(generateNode(length));
        return nodes;
    }
    _PermissionInternals.generateNodes = generateNodes;
    function generateNodePairs(number = 2, length, identical = false) {
        const nodePairs = [];
        for (let i = 0; i < number; i++)
            nodePairs.push(identical ? generateNodes(2, length).map((_, i, a) => a[0]) : generateNodes(2, length));
        return nodePairs;
    }
    _PermissionInternals.generateNodePairs = generateNodePairs;
    function generatePermissionSet() {
        return {
            grantedPermissions: _PermissionInternals.generateNodes(),
            negatedPermissions: _PermissionInternals.generateNodes()
        };
    }
    _PermissionInternals.generatePermissionSet = generatePermissionSet;
})(_PermissionInternals = exports._PermissionInternals || (exports._PermissionInternals = {}));
var PermissionsAPI;
(function (PermissionsAPI) {
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
    PermissionsAPI.nodesSatisfy = nodesSatisfy;
    let Utils;
    (function (Utils) {
        /**
         * Converts a node string to an array of its components
         * @param node the node stirng to collapse
         *
         * @returns 'a.b.c.d.e' => ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e']
         */
        Utils.segmentNode = (node) => node.split('.').reduce((a, c) => {
            const base = typeof a[a.length - 1] === 'undefined' ? '' : `${a[a.length - 1]}.`;
            a.push(base + c);
            return a;
        }, []);
    })(Utils = PermissionsAPI.Utils || (PermissionsAPI.Utils = {}));
    function nodeSatisfiesSet(node, set) {
        if (!set.grantedPermissions.find(checkNode => nodesSatisfy(node, checkNode)))
            return false;
        if (set.negatedPermissions.find(checkNode => nodesSatisfy(node, checkNode)))
            return false;
        return true;
    }
    PermissionsAPI.nodeSatisfiesSet = nodeSatisfiesSet;
    function compositePermissionSet(sets) {
        const grantedPermissions = [];
        const negatedPermissions = [];
        sets.forEach(set => {
            ArrayUtils.uniqueMerge(grantedPermissions, set.grantedPermissions);
            ArrayUtils.uniqueMerge(negatedPermissions, set.negatedPermissions);
        });
        return {
            grantedPermissions,
            negatedPermissions
        };
    }
    PermissionsAPI.compositePermissionSet = compositePermissionSet;
})(PermissionsAPI = exports.PermissionsAPI || (exports.PermissionsAPI = {}));
var ArrayUtils;
(function (ArrayUtils) {
    function uniqueMerge(array1, array2) {
        array2.forEach(val => array1.indexOf(val) > -1 ? undefined : array1.push(val));
        return array1;
    }
    ArrayUtils.uniqueMerge = uniqueMerge;
})(ArrayUtils = exports.ArrayUtils || (exports.ArrayUtils = {}));
//# sourceMappingURL=util.js.map