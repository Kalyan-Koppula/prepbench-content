**Key idea:** if the cows can be placed with every gap at least `d`, they can also be placed with gaps at least any smaller value. So binary search the largest feasible `d`. To test a `d`, sort the stalls and place cows greedily from the left, each in the first stall at least `d` past the previous cow.

## Recognising the pattern

"Maximise the minimum distance" is a classic **binary search on the answer** from the [Binary Search](/problems/patterns/binary-search) sheet. Feasibility is monotone (smaller gaps are easier), and checking one gap is a simple greedy pass over the sorted positions.

## Brute force

Sort the stalls. Try gaps from the largest possibly sensible value, `span / (k − 1)`, downward, and return the first one the greedy placement accepts. That is the reference brute force below.

Correct because it returns the largest feasible gap. Each check is `O(n)`, and up to `span / (k − 1)` gaps may be tried, which can be `10^9`. Space `O(n)` for the sorted copy.

## Optimal: binary search on the gap

**The check (greedy).** Put the first cow in the leftmost stall. Walk right, and place the next cow in the first stall at least `gap` past the last one. If you place `k` cows, the gap is feasible. Placing each cow as early as possible leaves the most room for the rest, so if greedy fails, nothing succeeds.

**The range.** The answer is at least 1 (stalls are distinct integers) and at most the full span between the first and last stall.

1. Sort the stalls.
2. `lo = 1`, `hi = last − first`.
3. While `lo < hi`:
   1. `mid = lo + ceil((hi − lo) / 2)`.
   2. If feasible, `lo = mid` (it works; try larger). Otherwise `hi = mid − 1`.
4. Return `lo`.

**Why round up?** This search moves `lo = mid` on success. With `lo` and `hi` adjacent and `mid` rounded down, `mid` would equal `lo`, and the loop would never end. Rounding up guarantees progress. (When searching for a minimum with `hi = mid`, you round down for the same reason.)

## Walkthrough

`stalls = [1, 2, 4, 8, 9]`, `k = 3`. Range `[1, 8]`.

| lo | hi | mid | greedy placement | feasible? |
| --- | --- | --- | --- | --- |
| 1 | 8 | 5 | 1, 8 (only 2 cows) | no → hi = 4 |
| 1 | 4 | 3 | 1, 4, 8 | yes → lo = 3 |
| 3 | 4 | 4 | 1, 8 (only 2) | no → hi = 3 |

Answer `3`.

## Complexity

- Brute force: time `O(n log n + n · span / k)`, space `O(n)`.
- Binary search: time `O(n log n)` for the sort plus `O(n log span)` for the checks. Space `O(n)` for the sorted copy.

## Edge cases

- `k = 2`: the answer is the full span (first and last stall).
- `k` equal to the number of stalls: every stall is used, so the answer is the smallest gap between neighbours.
- Unsorted input: sorting is required before the greedy check.

## Common mistakes

- Forgetting to sort.
- Rounding `mid` down while setting `lo = mid`, which loops forever.
- Starting the greedy anywhere other than the leftmost stall.

## In the interview

- State the monotonicity and the greedy check, then the rounding rule for "maximise" searches.
- Likely follow-ups:
  - *Return the stall positions?* Run the greedy once more with the final gap.
  - *Minimise the maximum distance instead?* A different objective; the binary search flips direction.
