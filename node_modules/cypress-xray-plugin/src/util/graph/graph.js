"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleDirectedGraph = exports.SimpleDirectedEdge = void 0;
const string_1 = require("../string");
const search_1 = require("./algorithms/search");
/**
 * A basic implementation of a directed edge.
 */
class SimpleDirectedEdge {
    /**
     * Constructs a new directed edge.
     *
     * @param source - the source vertex
     * @param destination - the destination vertex
     */
    constructor(source, destination) {
        this.source = source;
        this.destination = destination;
    }
    getSource() {
        return this.source;
    }
    getDestination() {
        return this.destination;
    }
}
exports.SimpleDirectedEdge = SimpleDirectedEdge;
/**
 * A basic implementation of a directed acyclic graph.
 */
class SimpleDirectedGraph {
    /**
     * Constructs an empty acyclic directed graph containing no vertices or edges.
     */
    constructor() {
        this.incomingEdges = new Map();
        this.outgoingEdges = new Map();
    }
    place(vertex) {
        if (this.outgoingEdges.has(vertex)) {
            throw new Error(`Duplicate vertex detected: ${(0, string_1.unknownToString)(vertex)}`);
        }
        this.outgoingEdges.set(vertex, new Set());
        this.incomingEdges.set(vertex, new Set());
        return vertex;
    }
    connect(source, destination) {
        var _a, _b;
        if (!this.outgoingEdges.has(source)) {
            throw new Error("Failed to connect vertices: the source vertex does not exist");
        }
        if (!this.outgoingEdges.has(destination)) {
            throw new Error("Failed to connect vertices: the destination vertex does not exist");
        }
        if ((0, search_1.dfs)(this, { destination: source, source: destination })) {
            throw new Error(`Failed to connect vertices ${(0, string_1.unknownToString)(source)} -> ${(0, string_1.unknownToString)(destination)}: cycle detected`);
        }
        for (const outgoingEdge of this.getOutgoing(source)) {
            if (outgoingEdge.getDestination() === destination) {
                throw new Error(`Failed to connect vertices ${(0, string_1.unknownToString)(source)} -> ${(0, string_1.unknownToString)(destination)}: duplicate edge detected`);
            }
        }
        const edge = new SimpleDirectedEdge(source, destination);
        (_a = this.outgoingEdges.get(source)) === null || _a === void 0 ? void 0 : _a.add(edge);
        (_b = this.incomingEdges.get(destination)) === null || _b === void 0 ? void 0 : _b.add(edge);
        return edge;
    }
    find(filter) {
        for (const vertex of this.getVertices()) {
            if (filter(vertex)) {
                return vertex;
            }
        }
        return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    findOrDefault(vertexClass, fallback, filter) {
        for (const vertex of this.getVertices()) {
            if (vertex instanceof vertexClass) {
                if (filter && !filter(vertex)) {
                    continue;
                }
                return vertex;
            }
        }
        return fallback();
    }
    *getVertices() {
        for (const vertex of this.outgoingEdges.keys()) {
            yield vertex;
        }
    }
    *getEdges() {
        for (const outgoing of this.outgoingEdges.values()) {
            for (const edge of outgoing) {
                yield edge;
            }
        }
    }
    size(type) {
        if (type === "vertices") {
            return this.outgoingEdges.size;
        }
        let count = 0;
        for (const outgoing of this.outgoingEdges.values()) {
            count += outgoing.size;
        }
        return count;
    }
    *getOutgoing(vertex) {
        const outgoing = this.outgoingEdges.get(vertex);
        if (outgoing === undefined) {
            throw new Error(`Unknown vertex: ${(0, string_1.unknownToString)(vertex)}`);
        }
        for (const edge of outgoing) {
            yield edge;
        }
    }
    *getIncoming(vertex) {
        const incoming = this.incomingEdges.get(vertex);
        if (incoming == undefined) {
            throw new Error(`Unknown vertex: ${(0, string_1.unknownToString)(vertex)}`);
        }
        for (const edge of incoming) {
            yield edge;
        }
    }
    hasOutgoing(vertex) {
        const outgoing = this.outgoingEdges.get(vertex);
        if (outgoing === undefined) {
            throw new Error(`Unknown vertex: ${(0, string_1.unknownToString)(vertex)}`);
        }
        return outgoing.size > 0;
    }
    hasIncoming(vertex) {
        const incoming = this.incomingEdges.get(vertex);
        if (incoming === undefined) {
            throw new Error(`Unknown vertex: ${(0, string_1.unknownToString)(vertex)}`);
        }
        return incoming.size > 0;
    }
    *getPredecessors(vertex) {
        for (const edge of this.getIncoming(vertex)) {
            yield edge.getSource();
        }
    }
    *getSuccessors(vertex) {
        for (const edge of this.getOutgoing(vertex)) {
            yield edge.getDestination();
        }
    }
}
exports.SimpleDirectedGraph = SimpleDirectedGraph;
