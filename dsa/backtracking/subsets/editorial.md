**Key insight:** each subset is a sequence of increasing indices. Backtracking with a `start` index walks a tree where every node — not just the leaves — is a distinct subset.

## Approach

1. `backtrack(start)` records a copy of `path`, then for each `i` from `start` onward: push `nums[i]`, recurse with `i + 1`, pop.
2. Because later calls only look at indices after `i`, each set of indices is generated once, in increasing order — no duplicates.

An equivalent framing is the binary "include / exclude" recursion: at index `i`, recurse once without `nums[i]` and once with it; record the path when `i === n`.

## Complexity

- Time `O(n · 2^n)`: `2^n` subsets, each copied in up to `O(n)`.
- Space `O(n)` recursion and path, excluding the output.

## Alternatives to mention

- **Bitmask:** for `mask` from `0` to `2^n - 1`, bit `i` says whether `nums[i]` is in. Iterative and short — great for `n <= 20`.
- **Iterative doubling:** start with `[[]]`; for each number, append a copy of every existing subset with that number added.

## Pitfalls

- `result.push(path)` instead of a copy — all entries alias the same array.
- Forgetting the empty subset.
