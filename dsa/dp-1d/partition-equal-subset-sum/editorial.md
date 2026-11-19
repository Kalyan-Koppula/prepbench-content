**Key idea:** two groups with equal sums each hold half the total. So the question is: does some subset sum to `total / 2`? Track which sums are reachable using a boolean array, adding the numbers one at a time, and updating sums from high to low so each number is used at most once.

## Recognising the pattern

"Can a subset hit this exact sum?" is the 0/1 knapsack with booleans from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. The values are small (sums up to 10,000), which is what makes a table over sums practical.

## Brute force

Trying all `2^n` subsets is hopeless for 200 numbers. The reference brute force below keeps the **set** of reachable sums, growing it with each number. It is the same idea as the DP, but builds a new set every time: correct, and slower by a constant factor.

## 0/1 knapsack over sums

1. If the total is odd, return `false`.
2. `target = total / 2`; `reachable[0] = true`.
3. For each number `x`: for `s` from `target` down to `x`: if `reachable[s − x]`, set `reachable[s] = true`. Stop early if `reachable[target]` becomes true.
4. Return `reachable[target]`.

**Why high to low.** When updating `reachable[s]` from `reachable[s − x]`, the smaller index must still describe subsets **without** `x`. Going downward guarantees that, because smaller indices haven't been updated for `x` yet. Going upward would let `x` be added twice (that is the unbounded version).

## Walkthrough

`nums = [1, 5, 11, 5]`, total 22, target 11.

| after number | reachable sums (≤ 11) |
| --- | --- |
| – | 0 |
| 1 | 0, 1 |
| 5 | 0, 1, 5, 6 |
| 11 | 0, 1, 5, 6, 11 → target reached |

Answer `true`: `{11}` and `{1, 5, 5}`.

## Complexity

- All subsets: `O(2^n)`.
- Set of sums: `O(n × target)` with set overhead.
- Boolean array: time `O(n × target)`, here at most `200 × 10,000`. Space `O(target)`.

## Edge cases

- Odd total: impossible.
- One number: impossible (the other group would be empty with sum 0).
- A number larger than half the total: no group can hold it alongside an equal other half, so the answer is `false` (it never updates any sum up to the target).

## Common mistakes

- Iterating sums upward, which reuses numbers.
- Forgetting the odd-total check.
- Trying to sort and greedily balance two piles, which fails in general.

## In the interview

- Reduce to "subset with sum total / 2" first; the DP follows.
- Likely follow-ups:
  - *Minimise the difference between the groups (Last Stone Weight II)?* The same table; pick the reachable sum closest to half.
  - *Split into `k` equal groups?* Backtracking with pruning, or DP over bitmasks for small `n`.
  - *Count the subsets?* Store counts instead of booleans.
