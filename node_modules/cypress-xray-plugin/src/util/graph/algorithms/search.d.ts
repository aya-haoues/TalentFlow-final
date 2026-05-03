import type { DirectedGraph } from "../graph";
/**
 * Models search parameters for when the destination vertex is known.
 */
interface KnownDestinationParameters<V> {
    /**
     * The destination vertex.
     */
    destination: V;
    /**
     * The starting vertex. If left `undefined`, the search will be performed for every vertex in
     * the graph which does not have any incoming edges.
     */
    source?: V;
}
/**
 * Models search parameters for when the destination vertex is unknown.
 */
interface UnknownDestinationParameters<V> {
    /**
     * A filter describing the destination vertex.
     *
     * @returns `true` for vertices which are considered the destination, `false` otherwise
     */
    filter: (vertex: V) => boolean;
    /**
     * The starting vertex. If left `undefined`, the search will be performed for every vertex in
     * the graph which does not have any incoming edges.
     */
    source?: V;
}
/**
 * Performs a depth-first search in a graph.
 *
 * @param graph - the graph
 * @param parameters - the search parameters
 * @returns `true` if the vertex described by the parameters can be reached, otherwise `false`
 */
export declare function dfs<V>(graph: DirectedGraph<V>, parameters: KnownDestinationParameters<V> | UnknownDestinationParameters<V>): boolean;
/**
 * Performs a breadth-first search in a graph.
 *
 * @param graph - the graph
 * @param parameters - the search parameters
 * @returns `true` if the vertex described by the parameters can be reached, otherwise `false`
 */
export declare function bfs<V>(graph: DirectedGraph<V>, parameters: KnownDestinationParameters<V> | UnknownDestinationParameters<V>): boolean;
export {};
