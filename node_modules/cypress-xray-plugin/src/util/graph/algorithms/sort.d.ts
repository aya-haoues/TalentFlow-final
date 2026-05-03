import type { DirectedGraph } from "../graph";
/**
 * Computes a topological order for all vertices contained in a directed graph.
 *
 * The computed order is not guaranteed to be stable, i.e. two vertices with the same topological
 * depth may share the same index.
 *
 * @param graph - the graph
 * @returns a mapping of vertices to their index in the computed order
 */
export declare function computeTopologicalOrder<V>(graph: DirectedGraph<V>): Map<V, number>;
export declare function traverse<V>(graph: DirectedGraph<V>, direction: "bottom-up" | "top-down"): Generator<V>;
