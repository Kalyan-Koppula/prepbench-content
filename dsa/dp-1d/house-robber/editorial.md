**Key insight:** for each house the only question is "take it or not"; taking it forces you to build on the best answer two houses back.

## Approach

- **State:** `best[i]` = most cash from houses `0 … i - 1` (a prefix of length `i`).
- **Recurrence:** `best[i] = max(best[i - 1], best[i - 2] + nums[i - 1])` — skip house `i - 1`, or take it and skip its left neighbour.
- **Base cases:** `best[0] = 0` (no houses), `best[1] = nums[0]` (follows from the recurrence with `best[-1] = 0`).
- **Order:** left to right; answer `best[n]`.
- **Space optimisation:** the recurrence reads two previous values, so carry `prev1` / `prev2`.

Progression: the brute recursion branches twice per house (`O(2ⁿ)`); memoising on the index gives `O(n)`; tabulate; then roll the table into two variables.

## Complexity

- Time `O(n)`.
- Space `O(1)`.

## Pitfalls

- Greedy "take all even or all odd indices" fails: `[2, 1, 1, 2]` needs houses 0 and 3.
- Update order: compute `cur` from the old `prev1`/`prev2` before shifting them.

## Follow-ups

- Houses in a circle → House Robber II (run this twice on two ranges).
- Houses on a tree → post-order DP returning `(take, skip)` per node.
