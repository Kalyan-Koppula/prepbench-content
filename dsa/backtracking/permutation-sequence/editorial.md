**Key insight:** in sorted order, permutations come in blocks of `(n-1)!` that share the same first digit. Dividing `k - 1` by the block size picks the first digit directly; the remainder ranks the permutation within that block. Repeat — no enumeration needed.

## Approach

1. Keep the unused digits in ascending order, and precompute factorials up to `n`.
2. Convert to a 0-indexed rank: `rank = k - 1`.
3. For `remaining = n` down to `1`:
   - `block = (remaining - 1)!`.
   - `index = floor(rank / block)` selects the next digit from the unused list; remove it.
   - `rank = rank % block`.

This is reading `k - 1` in the **factorial number system**: each "digit" says which unused element comes next.

Example: `n = 4`, `k = 10` → `rank = 9`. Blocks of `3! = 6`: index `1` → digit `2`, rank `3`. Blocks of `2! = 2`: index `1` of `[1, 3, 4]` → `3`, rank `1`. Blocks of `1`: index `1` of `[1, 4]` → `4`, rank `0`. Last: `1`. Answer `"2341"`.

## Complexity

- Time `O(n²)` — `n` steps, each removing from an array of length `<= n`. Trivial for `n <= 9`.
- Space `O(n)`.

## Alternatives to mention

- Generate permutations in order by backtracking (or apply next-permutation `k - 1` times) until the `k`-th: `O(n! · n)` in the worst case. Fine for small `n`, but say why the direct method is better.

## Pitfalls

- Forgetting to convert `k` to 0-indexed — every answer shifts by one.
- Recomputing factorials inside the loop is harmless here but shows sloppiness; precompute.
