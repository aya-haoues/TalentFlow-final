"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
/**
 * Models a basic stack structure.
 */
class Stack {
    /**
     * Constructs a new stack.
     *
     * @param elements - the initial elements
     */
    constructor(elements) {
        this.elements = elements !== null && elements !== void 0 ? elements : [];
    }
    /**
     * Pushes an element on top of the stack.
     *
     * @param element - the element
     */
    push(element) {
        this.elements.push(element);
        return this;
    }
    /**
     * Pops the top element off the stack.
     *
     * @returns the top element
     */
    pop() {
        const top = this.elements.pop();
        if (top === undefined) {
            throw new Error("Stack is empty");
        }
        return top;
    }
    /**
     * Returns the top element of the stack without popping it.
     *
     * @returns the top element
     */
    top() {
        if (this.size() === 0) {
            throw new Error("Stack is empty");
        }
        return this.elements[this.elements.length - 1];
    }
    /**
     * Returns the number of elements in the stack.
     *
     * @returns the size
     */
    size() {
        return this.elements.length;
    }
    /**
     * Returns whether the stack already contains a specific element.
     *
     * @param element - the element
     * @returns `true` if the stack contains the element, otherwise `false`
     */
    has(element) {
        return this.elements.includes(element);
    }
    /**
     * Checks if the stack is empty.
     *
     * @returns `true` if the stack is empty, otherwise `false`
     */
    isEmpty() {
        return this.size() === 0;
    }
}
exports.Stack = Stack;
