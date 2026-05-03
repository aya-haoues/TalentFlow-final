/**
 * Models a basic queue structure.
 *
 * Inspired by:
 * - {@link https://github.com/datastructures-js/queue}
 * - {@link https://www.npmjs.com/package/@datastructures-js/queue}
 *
 * Extends the original queue with `has` and `find` methods and removes superfluous methods.
 */
export declare class Queue<T> {
    private elements;
    private offset;
    /**
     * Constructs a new queue.
     *
     * @param elements - the initial elements
     */
    constructor(elements?: T[]);
    /**
     * Adds an element to the back of the queue.
     *
     * @param element - the element
     */
    enqueue(element: T): this;
    /**
     * Dequeues the front element in the queue.
     *
     * @returns the front element
     * @throws if the queue is empty
     */
    dequeue(): T;
    /**
     * Returns the front element of the queue without dequeuing it.
     *
     * @returns the front element
     * @throws if the queue is empty
     */
    peek(): T;
    /**
     * Returns the number of elements in the queue.
     *
     * @returns the size
     */
    size(): number;
    /**
     * Returns whether the queue already contains a specific element.
     *
     * @param element - the element
     * @returns `true` if the queue contains the element, otherwise `false`
     */
    has(element: T): boolean;
    /**
     * Searches for a specific element in the queue. Every element will be visited exactly once.
     *
     * @param filter - the filter function
     * @returns the first matching element or `undefined` if no element matches the filter function
     */
    find(filter: (element: T) => boolean): T | undefined;
    /**
     * Checks if the queue is empty.
     *
     * @returns `true` if the queue is empty, otherwise `false`
     */
    isEmpty(): boolean;
}
