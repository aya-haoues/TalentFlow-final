/**
 * Dedents strings based on the first non-empty line contained within. Lines with less indentation
 * than the first non-empty line are indented at least as much as that line (which is different to
 * what other libraries like [dedent](https://www.npmjs.com/package/dedent) do).
 *
 * This also applies to expression whitespace.
 *
 * @param string - the string
 * @returns the dedented string
 */
export declare function dedent(string: string): string;
