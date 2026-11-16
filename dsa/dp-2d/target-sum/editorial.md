**Key insight:** splitting the numbers into a plus-group `P` and a minus-group `N` gives `sum(P) = (total + target) / 2`, so the question becomes "how many subsets have this sum?" — a 0/1 knapsack count.

## Approach

1. `total = sum(nums)`. If `|target| > total` or `total + target` is odd, return `0`.
2. `goal = (total + target) / 2`.
3. Count subsets summing to `goal`:
   - **State:** `count[i][s]` = number of subsets of the first `i` numbers with sum `s`.
   - **Recurrence:** `count[i][s] = count[i-1][s] + count[i-1][s - x]` (second term if `s ≥ x`), `x = nums[i-1]`.
   - **Base cases:** `count[0][0] = 1`, `count[0][s > 0] = 0`.
   - **Order:** `i` increasing.
   - **Space optimisation:** one array with `s` swept **downward**, so `count[s - x]` is still the previous row's value.
4. Zeros need no special case: for `x = 0` the update doubles `count[s]` for every `s`, matching the two sign choices.

Progression: the brute force tries all `2ⁿ` sign patterns; memoising on `(index, running sum)` gives `O(n · total)` states (offset the sum to stay non-negative); the algebraic reduction shrinks it to the subset-count table above.

## Complexity

- Time `O(n · goal)` ≤ `O(n · total)`.
- Space `O(goal)`.

## Alternatives to mention

- Memoised DFS over `(i, sum)` with a `Map` — fine for `n ≤ 20` and directly mirrors the problem statement; good if you don't spot the algebra.

## Pitfalls

- Missing the parity / range check: `goal` must be a non-negative integer.
- Iterating `s` upward lets one number be counted multiple times.
- Starting the inner loop at `s >= 1` instead of `s >= x` skips zeros entirely (then the doubling never happens).
