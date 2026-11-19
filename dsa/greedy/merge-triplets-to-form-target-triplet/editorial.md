**Key idea:** merging takes the maximum in each position, so values can only grow. A triplet with **any** value above the target can never be used, because it would push that position past the target forever. Every other triplet is safe to merge. Merge all the safe ones and check whether the result equals the target.

## Recognising the pattern

An operation that only ever increases values (here `max`) means "safe" choices can all be taken at once. That is a filter-then-combine greedy from the [Greedy](/problems/patterns/greedy) sheet. There is no ordering to search: `max` is commutative, so merging all safe triplets gives the best possible result.

## Brute force

Trying every subset of triplets to merge is `O(2^n)`. The greedy shows it is unnecessary, so there is no reference brute force for this problem.

## Filter and merge

1. `merged = [0, 0, 0]`.
2. For each triplet `t`:
   - If `t[k] > target[k]` for any `k`, skip it.
   - Otherwise `merged[k] = max(merged[k], t[k])` for each `k`.
3. Return whether `merged` equals `target`.

**Why merging every safe triplet is fine.** A safe triplet is at most the target in every position, so merging it can't overshoot. It can only bring positions closer to the target. Including it never hurts.

**Why that is enough.** If some combination of triplets produces the target, all of them are safe, and merging every safe triplet produces something at least as large in each position, but never above the target. So it equals the target.

## Walkthrough

`triplets = [[1, 4, 2], [3, 1, 5], [2, 3, 3], [1, 5, 1]]`, `target = [3, 4, 5]`

| triplet | safe? | merged after |
| --- | --- | --- |
| [1, 4, 2] | yes | [1, 4, 2] |
| [3, 1, 5] | yes | [3, 4, 5] |
| [2, 3, 3] | yes | [3, 4, 5] |
| [1, 5, 1] | no (5 > 4) | [3, 4, 5] |

`merged` equals the target. Answer `true`.

## Complexity

- All subsets: `O(2^n)`.
- Filter and merge: `O(n)` time, `O(1)` space.

## Edge cases

- No safe triplets: `merged` stays `[0, 0, 0]`, false (target values are at least 1).
- One triplet equal to the target: true.
- Each target value supplied by a different triplet: still true; merging combines them.

## Common mistakes

- Merging every triplet without the safety filter.
- Checking each position separately against **different** subsets without the filter, which can mix in unsafe triplets.
- Searching subsets.

## In the interview

- Make both arguments (safe never hurts, and the full safe merge is enough); the code is then a few lines.
- Likely follow-ups:
  - *Fewest triplets needed?* For each position, you need one safe triplet that matches the target there; at most three, found in the same pass.
  - *Longer tuples?* The same idea, `O(n · k)`.
