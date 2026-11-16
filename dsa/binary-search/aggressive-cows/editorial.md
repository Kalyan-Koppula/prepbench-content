**Key insight:** "maximise the minimum gap" → binary search on the gap. For a candidate `d`, greedily place cows left to right in sorted stalls; if `k` fit, `d` is achievable, and so is every smaller gap.

## Approach

1. Sort `stalls`.
2. `canPlace(d)`: put the first cow in the first stall, then put each next cow in the first stall at least `d` past the previous cow. Succeed once `k` cows are placed.
3. Search `d` in `[1, last - first]` for the **last** `d` where `canPlace` holds. Since we keep `lo = mid` on success, round `mid` up: `mid = Math.ceil((lo + hi) / 2)`.
4. Return `lo`. (`d = 1` always works because positions are distinct integers.)

Greedy is optimal for a fixed `d`: placing a cow as early as possible leaves the most room for the rest.

## Complexity

- Time `O(n log n)` for the sort plus `O(n log R)` for the search, where `R = max - min`.
- Space `O(1)` beyond the sort.

## Alternatives to mention

- Try every `d` downward from `(max - min) / (k - 1)`: `O(n · R)` worst case.
- Checking all `C(n, k)` placements is exponential — only worth naming.

## Pitfalls

- Forgetting to sort — the input is unordered.
- `mid` rounding down with `lo = mid` loops forever when `hi = lo + 1`.
- The tighter upper bound `(max - min) / (k - 1)` is a nice touch but not required.
