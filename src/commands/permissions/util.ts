import { PermissionSet } from "./types";

export namespace _PermissionInternals {
    /**
     * Determines whether a node satisfies another node
     * @param node the node to test
     * @param satisfyingNode the node to use in testing
     * 
     * checks for wildcards and for literal matches
     */
    export function nodesSatisfy(node: string, satisfyingNode: string): boolean {
        if (node === satisfyingNode) return true;

        const nodeSegments = node.split('.');;
        const satisfyingSegments = satisfyingNode.split('.');

        for (let i = 0; i < nodeSegments.length; i++) {
            if (satisfyingSegments[i] === '*') return true;
            if (nodeSegments[i] !== satisfyingSegments[i]) break;
        }

        return false;
    }

    export function generateNode(length: number = 3) {
        const generateSegment = () => Math.random().toString(36).replace('0.', '').substring(0, 4);
    
        const segments: string[] = [];
    
        for (let i = 0; i < length; i++) segments.push(generateSegment());
    
        return segments.join(".");
    }
    
    export function generateNodes(number: number = 2, length?: number) {
        const nodes: string[] = [];
    
        for (let i = 0; i < number; i++) nodes.push(generateNode(length));
    
        return nodes;
    }
    
    export function generateNodePairs(number: number = 2, length?: number, identical: boolean = false) {
        const nodePairs: string[][] = [];
    
        for (let i = 0; i < number; i++) nodePairs.push(identical ? generateNodes(2, length).map((_, i, a) => a[0]) : generateNodes(2, length));
    
        return nodePairs;
    }

    export function generatePermissionSet(): PermissionSet {
        return {
            grantedPermissions: _PermissionInternals.generateNodes(),
            negatedPermissions: _PermissionInternals.generateNodes()
        };
    }
}

export namespace PermissionsAPI {
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
    export function nodesSatisfy(node1: string, node2: string): boolean {
        return _PermissionInternals.nodesSatisfy(node1, node2) || _PermissionInternals.nodesSatisfy(node2, node1);
    }

    export namespace Utils {
        /**
         * Converts a node string to an array of its components
         * @param node the node stirng to collapse
         * 
         * @returns 'a.b.c.d.e' => ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e']
         */
        export const segmentNode = (node: string) => node.split('.').reduce((a, c) => {
            const base = typeof a[a.length - 1] === 'undefined' ? '' : `${a[a.length - 1]}.`;
            a.push(base + c);
            return a;
        }, [] as string[]);
    }

    export function nodeSatisfiesSet(node: string, set: PermissionSet) {
        if (!set.grantedPermissions.find(checkNode => nodesSatisfy(node, checkNode))) return false;

        if (set.negatedPermissions.find(checkNode => nodesSatisfy(node, checkNode))) return false;

        return true;
    }

    export function compositePermissionSet(sets: Array<PermissionSet>): PermissionSet {
        const grantedPermissions: string[] = [];
        const negatedPermissions: string[] = [];

        sets.forEach(set => {
            ArrayUtils.uniqueMerge(grantedPermissions, set.grantedPermissions);
            ArrayUtils.uniqueMerge(negatedPermissions, set.negatedPermissions)
        });

        return {
            grantedPermissions,
            negatedPermissions
        };
    }
}

export namespace ArrayUtils {
    export function uniqueMerge<K, T>(array1: K[], array2: T[]): Array<K | T> {
        array2.forEach(val => array1.indexOf(<any>val as K) > -1 ? undefined : array1.push(<any>val as K));
        return array1;
    }
}