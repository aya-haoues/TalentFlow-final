"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeOverlap = computeOverlap;
/**
 * Computes the overlap of two iterables, i.e. their intersection and differences at the same time.
 *
 * @example
 *
 * ```ts
 * console.log(computeOverlap([1, 2, 3], [2, 5, 9, 1]));
 * // {
 * //   intersection: [1, 2],
 * //   leftOnly: [3],
 * //   rightOnly: [5, 9]
 * // }
 * ```
 *
 * @param left - the first iterable
 * @param right - the second iterable
 * @returns the overlap
 */
function computeOverlap(left, right) {
    const sets = {
        intersection: [],
        leftOnly: [],
        rightOnly: [],
    };
    const leftSet = new Set(left);
    const rightSet = new Set(right);
    for (const element of leftSet) {
        if (rightSet.has(element)) {
            sets.intersection.push(element);
        }
        else {
            sets.leftOnly.push(element);
        }
    }
    for (const element of rightSet) {
        if (!leftSet.has(element)) {
            sets.rightOnly.push(element);
        }
    }
    return sets;
}
