**Key insight:** sort, fix the smallest element `nums[i]`, and find pairs summing to `-nums[i]` in the sorted suffix with two pointers. Sorting also makes duplicates adjacent, so skipping repeats gives distinct triplets without a set.

## Approach

1. Sort ascending.
2. For each `i` (stop early once `nums[i] > 0` — nothing to its right can bring the sum down to zero):
   - If `nums[i] === nums[i - 1]`, skip: that anchor was already fully explored.
   - `l = i + 1`, `r = n - 1`. While `l < r`, compare `nums[i] + nums[l] + nums[r]` with `0`:
     - too small → `l++`; too big → `r--`;
     - zero → record it, move both pointers, then advance `l` while it equals the previous value.
3. Return the collected triplets.

## Complexity

- Time `O(n²)` — `n` anchors × a linear two-pointer scan; the sort is dominated.
- Space `O(1)` extra beyond the output (or `O(n)` depending on the sort implementation).

## Alternatives to mention

- Brute force over all triples plus a set of sorted keys: `O(n³)`.
- Per-anchor hash set (two-sum style): also `O(n²)`, but deduplication is messier and uses `O(n)` space.

## Pitfalls

- Deduplicate at both levels: the anchor `i` and the inner `l` (moving `l` past equal values is enough; `r` follows naturally).
- Checking `nums[i] === nums[i + 1]` instead of `nums[i - 1]` wrongly skips triplets like `[-1, -1, 2]`.
