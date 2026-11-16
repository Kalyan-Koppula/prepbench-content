**Key insight:** choose the first palindromic piece, then recursively partition what's left. Every root-to-leaf path in that decision tree is one valid partition.

## Approach

1. Precompute `isPal[i][j]` with DP: `s[i] === s[j]` and the inside `s[i+1..j-1]` is a palindrome (or has length `< 2`). Fill `i` from right to left so the inner span is ready.
2. `backtrack(start)`:
   - If `start === n`, record a copy of `path`.
   - For each `end` from `start` to `n - 1` with `isPal[start][end]`: push `s.slice(start, end + 1)`, recurse from `end + 1`, pop.

## Complexity

- Time `O(n · 2^n)`: there are up to `2^(n-1)` partitions (all-equal letters), each costing `O(n)` to build and copy.
- Space `O(n²)` for the table, `O(n)` recursion depth.

## Alternatives to mention

- Check palindromes on the fly with two pointers: same exponential bound, an extra `O(n)` per check. Fine to start with, then mention the table.
- Enumerating all `2^(n-1)` cut patterns and filtering: correct and simple, but explores partitions that fail early.
- **Palindrome Partitioning II** (minimum cuts) drops the enumeration and becomes an `O(n²)` DP — a common follow-up.

## Pitfalls

- Recording `path` without copying.
- Off-by-one in `slice(start, end + 1)`.
