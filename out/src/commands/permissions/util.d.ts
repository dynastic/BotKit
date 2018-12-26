export declare namespace _PermissionInternals {
    /**
     * Determines whether a node satisfies another node
     * @param node the node to test
     * @param satisfyingNode the node to use in testing
     *
     * checks for wildcards and for literal matches
     */
    function nodesSatisfy(node: string, satisfyingNode: string): boolean;
}
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
export declare function nodesSatisfy(node1: string, node2: string): boolean;
/**
 * Converts a node string to an array of its components
 * @param node the node stirng to collapse
 *
 * @returns 'a.b.c.d.e' => ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.c.d.e']
 */
export declare const segmentNode: (node: string) => string[];
