/**
 * Models a basic stack structure.
 */
export declare class Stack<T> {
    private readonly elements;
    /**
     * Constructs a new stack.
     *
     * @param elements - the initial elements
     */
    constructor(elements?: T[]);
    /**
     * Pushes an element on top of the stack.
     *
     * @param element - the element
     */
    push(element: T): this;
    /**
     * Pops the top element off the stack.
     *
     * @returns the top element
     */
    pop(): T;
    /**
     * Returns the top element of the stack without popping it.
     *
     * @returns the top element
     */
    top(): T;
    /**
     * Returns the number of elements in the stack.
     *
     * @returns the size
     */
    size(): number;
    /**
     * Returns whether the stack already contains a specific element.
     *
     * @param element - the element
     * @returns `true` if the stack contains the element, otherwise `false`
     */
    has(element: T): boolean;
    /**
     * Checks if the stack is empty.
     *
     * @returns `true` if the stack is empty, otherwise `false`
     */
    isEmpty(): boolean;
}
