**Key insight:** grow the string left to right and only ever make legal moves — add `(` while you have some left, add `)` only when it closes an open one. Every leaf of that search is a valid answer, so nothing is wasted.

## Approach

1. Recurse with `(current, open, close)`.
2. If `open < n`, try appending `(`.
3. If `close < open`, try appending `)`.
4. When the length reaches `2n`, record the string.

The `close < open` rule is the stack invariant in disguise: `open - close` is the depth of unmatched openers.

## Complexity

- The output has `C(n)` strings (the `n`-th Catalan number, about `4^n / (n^1.5)`), each of length `2n` — so `O(4^n / sqrt(n))` time overall.
- Recursion depth `O(n)`, plus the output.

## Alternatives to mention

- Brute force: generate all `2^(2n)` strings and filter valid ones — `O(2^(2n) · n)`.
- Catalan decomposition: every valid string is `(A)B` with `A` and `B` valid; build from smaller `n` with memoisation.

## Pitfalls

- Allowing `)` when `close < n` instead of `close < open` produces invalid prefixes like `)(`.
- Mutating a shared array/string builder without undoing the change on the way back up.
