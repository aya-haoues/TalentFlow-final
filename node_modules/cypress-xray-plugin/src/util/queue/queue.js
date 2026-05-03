"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
/**
 * Models a basic queue structure.
 *
 * Inspired by:
 * - {@link https://github.com/datastructures-js/queue}
 * - {@link https://www.npmjs.com/package/@datastructures-js/queue}
 *
 * Extends the original queue with `has` and `find` methods and removes superfluous methods.
 */
class Queue {
    /**
     * Constructs a new queue.
     *
     * @param elements - the initial elements
     */
    constructor(elements) {
        this.elements = elements !== null && elements !== void 0 ? elements : [];
        this.offset = 0;
    }
    /**
     * Adds an element to the back of the queue.
     *
     * @param element - the element
     */
    enqueue(element) {
        this.elements.push(element);
        return this;
    }
    /**
     * Dequeues the front element in the queue.
     *
     * @returns the front element
     * @throws if the queue is empty
     */
    dequeue() {
        const first = this.peek();
        this.offset += 1;
        if (this.offset * 2 < this.elements.length) {
            return first;
        }
        this.elements = this.elements.slice(this.offset);
        this.offset = 0;
        return first;
    }
    /**
     * Returns the front element of the queue without dequeuing it.
     *
     * @returns the front element
     * @throws if the queue is empty
     */
    peek() {
        if (this.size() === 0) {
            throw new Error("Queue is empty");
        }
        return this.elements[this.offset];
    }
    /**
     * Returns the number of elements in the queue.
     *
     * @returns the size
     */
    size() {
        return this.elements.length - this.offset;
    }
    /**
     * Returns whether the queue already contains a specific element.
     *
     * @param element - the element
     * @returns `true` if the queue contains the element, otherwise `false`
     */
    has(element) {
        return this.find((other) => other === element) !== undefined;
    }
    /**
     * Searches for a specific element in the queue. Every element will be visited exactly once.
     *
     * @param filter - the filter function
     * @returns the first matching element or `undefined` if no element matches the filter function
     */
    find(filter) {
        for (let i = this.offset; i < this.elements.length; i++) {
            if (filter(this.elements[i])) {
                return this.elements[i];
            }
        }
        return undefined;
    }
    /**
     * Checks if the queue is empty.
     *
     * @returns `true` if the queue is empty, otherwise `false`
     */
    isEmpty() {
        return this.size() === 0;
    }
}
exports.Queue = Queue;
