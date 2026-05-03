import type { Computable, Stateful } from "../../hooks/command";
import { ComputableState } from "../../hooks/command";
import type { DirectedEdge, SimpleDirectedEdge } from "./graph";
import { SimpleDirectedGraph } from "./graph";
/**
 * Models a graph which can be executed in a top-down fashion, i.e. starting at vertices without
 * incoming edges and progressing towards leaf vertices without outgoing edges.
 */
export declare class ExecutableGraph<V extends Computable<unknown> & Stateful<ComputableState>> extends SimpleDirectedGraph<V> {
    /**
     * Maps vertices to their execution states.
     */
    private readonly states;
    /**
     * Stores edges which are optional, i.e. that the destination vertex should still compute even
     * if the predecessor failed to compute its result.
     */
    private readonly optionalEdges;
    /**
     * Triggers the graph's execution.
     */
    execute(): Promise<void>;
    /**
     * Connects two vertices in the graph with an edge. If the graph does not yet contain the
     * vertices, they will automatically be inserted prior to the connection.
     *
     * @param source - the source vertex
     * @param destination - the destination vertex
     * @param optional - `true` to mark the edge optional, `false` otherwise
     * @returns the new edge
     * @throws if the connection would introduce a duplicate edge or a cycle
     */
    connect<S extends V, D extends V>(source: S, destination: D, optional?: boolean): SimpleDirectedEdge<S, D>;
    /**
     * Returns whether an edge is an optional edge.
     *
     * @param edge - the edge
     * @returns `true` if the edge is optional, `false` otherwise
     */
    isOptional(edge: DirectedEdge<V>): boolean;
    private executeFollowedBySuccessors;
    private markForbidden;
    private canQueueVertex;
}
