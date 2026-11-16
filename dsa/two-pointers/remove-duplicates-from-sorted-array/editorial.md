**Key insight:** in sorted input duplicates are adjacent, so a value belongs in the output exactly when it differs from the last value written. A slow write pointer and a fast read pointer compact the array in one pass.

## Approach

1. `write = 1` — the first element is always kept.
2. For `read` from `1` to `n - 1`: if `nums[read] !== nums[write - 1]`, copy it to `nums[write]` and increment `write`.
3. `write` is now `k`; return `nums.slice(0, write)`.

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)` for the compaction (the returned slice is just the output).

## Alternatives to mention

- `[...new Set(nums)]` gives the right values in `O(n)` space — fine in production code, but not what this question tests.
- Generalisation ("keep at most two copies"): compare with `nums[write - 2]` instead of `nums[write - 1]`. A common follow-up.

## Pitfalls

- Comparing with `nums[read - 1]` also works for this version, but comparing with the last *written* value is the form that generalises.
- Don't splice inside the loop — each `splice` is `O(n)`, making the whole thing `O(n²)`.
