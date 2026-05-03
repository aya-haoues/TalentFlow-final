"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dfs = dfs;
exports.bfs = bfs;
const queue_1 = require("../../queue/queue");
const stack_1 = require("../../stack/stack");
/**
 * Performs a depth-first search in a graph.
 *
 * @param graph - the graph
 * @param parameters - the search parameters
 * @returns `true` if the vertex described by the parameters can be reached, otherwise `false`
 */
function dfs(graph, parameters) {
    const stack = new stack_1.Stack();
    return search(graph, parameters, {
        isEmpty: stack.isEmpty.bind(stack),
        pop: stack.pop.bind(stack),
        push: stack.push.bind(stack),
    });
}
/**
 * Performs a breadth-first search in a graph.
 *
 * @param graph - the graph
 * @param parameters - the search parameters
 * @returns `true` if the vertex described by the parameters can be reached, otherwise `false`
 */
function bfs(graph, parameters) {
    const queue = new queue_1.Queue();
    return search(graph, parameters, {
        isEmpty: queue.isEmpty.bind(queue),
        pop: queue.dequeue.bind(queue),
        push: queue.enqueue.bind(queue),
    });
}
function search(graph, parameters, worklist) {
    const isDestination = (vertex) => {
        if ("destination" in parameters) {
            if (vertex === parameters.destination) {
                return true;
            }
        }
        else if (parameters.filter(vertex)) {
            return true;
        }
        return false;
    };
    if (parameters.source !== undefined) {
        if (isDestination(parameters.source)) {
            return true;
        }
        worklist.push(parameters.source);
    }
    else {
        for (const vertex of graph.getVertices()) {
            if (!graph.hasIncoming(vertex)) {
                worklist.push(vertex);
            }
        }
    }
    const discoveredVertices = new Set();
    while (!worklist.isEmpty()) {
        const currentVertex = worklist.pop();
        discoveredVertices.add(currentVertex);
        for (const edge of graph.getOutgoing(currentVertex)) {
            const edgeDestination = edge.getDestination();
            if (isDestination(edgeDestination)) {
                return true;
            }
            if (!discoveredVertices.has(edgeDestination)) {
                worklist.push(edgeDestination);
            }
        }
    }
    return false;
}
