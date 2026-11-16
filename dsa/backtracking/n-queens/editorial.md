**Key insight:** exactly one queen goes in each row, so the search is "pick a column for row 0, then row 1, …". A square is safe iff its column, its `r - c` diagonal and its `r + c` anti-diagonal are all unused — three sets make that O(1).

## Approach

1. `place(r)`: if `r === n`, all rows have a queen — render the board and record it.
2. Otherwise, for each column `c`: skip if `c`, `r - c` or `r + c` is taken. Else mark all three, remember `c` for row `r`, recurse on `r + 1`, then unmark.
3. Render a solution by turning each row's column into `'.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)`.

## Complexity

- Time `O(n!)` as an upper bound: row `r` has at most `n - r` free columns, and diagonal checks prune far more. Rendering adds `O(n²)` per solution.
- Space `O(n)` for the sets and recursion, excluding the output.

## Alternatives to mention

- Check safety by scanning previous rows: `O(n)` per check instead of `O(1)`. Fine, but the sets are the expected improvement.
- Bitmasks instead of sets: `available = ~(cols | diagL | diagR) & full`, iterate set bits with `x & -x`, shift the diagonal masks by one per row. Fastest known simple approach.
- **N-Queens II** asks only for the count — same search, no rendering.

## Pitfalls

- Mixing up the diagonal keys: cells on the same `\` diagonal share `r - c`, on the same `/` diagonal share `r + c`. `r - c` can be negative — fine with a `Set`, offset by `n - 1` if you use an array.
- Forgetting to remove the marks after the recursive call.
