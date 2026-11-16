**Key insight:** the circle adds exactly one conflict — first vs last — so break it by solving the straight row twice: once without the last house, once without the first.

## Approach

1. If there is one house, take it.
2. Any valid plan leaves house `0` or house `n - 1` (or both) untouched, so the optimum is the better of:
   - House Robber on `nums[0 … n-2]`,
   - House Robber on `nums[1 … n-1]`.
3. Each run is the linear DP:
   - **State:** `best[i]` = most cash from the first `i` houses of the range.
   - **Recurrence:** `best[i] = max(best[i - 1], best[i - 2] + house)`.
   - **Base cases:** `best[0] = 0`, and `best[-1]` treated as `0`.
   - **Order:** left to right across the range.
   - **Space optimisation:** two rolling variables.

Progression: brute recursion with a "took house 0" flag → memoise on `(i, tookFirst)` → two linear tabulations → rolling variables.

## Complexity

- Time `O(n)` — two linear passes.
- Space `O(1)`.

## Pitfalls

- `n = 1`: both ranges are empty and you'd return `0` — handle it first.
- Don't try to detect "did the linear answer use both ends" after the fact; the two-range split is cleaner and provably complete.
- `n = 2` works naturally: each range is a single house.
