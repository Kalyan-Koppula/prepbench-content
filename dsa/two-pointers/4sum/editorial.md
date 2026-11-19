**Key idea:** the 3Sum recipe with one more fixed value. Sort, fix the first two values with nested loops, and find the remaining pairs with a two-pointer sweep. Skip repeated values at every level so each quadruplet appears once.

## Recognising the pattern

`k` numbers adding up to a target, unique by value: sort, fix `k - 2` values, and finish with the opposite-ends sweep from the [Two Pointers](/problems/patterns/two-pointers) sheet. Each extra fixed value multiplies the cost by `n`, so 4Sum is `O(n³)`.

## Brute force

Try every quadruple `i < j < k < m`. For each one that hits the target, sort its four values, build a string key, and keep it if the key is new. That is the reference brute force below.

Correct because it checks every quadruple. Time `O(n⁴)`, which for `n = 200` is about 65 million checks. It passes here, but it doesn't scale.

## Optimal: sort, fix two, sweep

1. Sort a copy of the array.
2. For each `i`, skipping a value equal to the previous `i`:
   1. For each `j > i`, skipping a value equal to the previous `j` (for this `i`):
      1. `remaining = target - sorted[i] - sorted[j]`.
      2. `left = j + 1`, `right = n - 1`. While `left < right`:
         - If `sorted[left] + sorted[right]` is below `remaining`, `left++`; above, `right--`.
         - Equal: record the quadruplet, move both pointers, and skip over repeated values on both sides.
3. Return the quadruplets.

**The skip conditions.** For `j`, the test is `j > i + 1 && sorted[j] === sorted[j - 1]`. The `j > i + 1` part lets `j` use a value equal to `sorted[i]` the first time, for answers like `[2, 2, 2, 2]`, and only skips later repeats.

**Overflow.** Values reach `10^9`, so a sum of four can reach `4 · 10^9`. JavaScript numbers represent that exactly. In Java or C++ you must use a 64-bit type (`long`), or compare against `remaining` computed in 64 bits. Interviewers often check that you notice this.

Optional pruning: if the smallest possible sum for the current `i` (or `j`) already exceeds the target, break; if the largest is still below it, continue. Same worst case, faster in practice.

## Walkthrough

`nums = [1, 0, -1, 0, -2, 2]`, `target = 0`, sorted `[-2, -1, 0, 0, 1, 2]`

| i | j | remaining | pairs found by the sweep | quadruplets |
| --- | --- | --- | --- | --- |
| −2 | −1 | 3 | (1, 2) | [−2, −1, 1, 2] |
| −2 | 0 | 2 | (0, 2) | [−2, 0, 0, 2] |
| −2 | 0 (repeat) | – | skipped | |
| −1 | 0 | 1 | (0, 1) | [−1, 0, 0, 1] |
| −1 | 0 (repeat) | – | skipped | |
| 0 | 0 | 0 | none (1 + 2 = 3) | |

Answer: `[[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]`.

## Complexity

- Brute force: time `O(n⁴)`, space `O(q)` for `q` quadruplets.
- Sort plus two loops plus sweep: time `O(n³)`. Space `O(n)` for the sorted copy.

## Edge cases

- Fewer than four elements: no quadruplet, return `[]`.
- All values equal, like `[2, 2, 2, 2, 2]` with target 8: exactly one quadruplet.
- Large values near `10^9`: fine in JavaScript, overflow in 32-bit languages.
- Negative target: nothing changes, but early-exit pruning must not assume a positive target.

## Common mistakes

- Skipping `j` duplicates with `j > 0` instead of `j > i + 1`, which loses answers where the first two values are equal.
- Forgetting to skip duplicates after a match.
- Copying the 3Sum shortcut "stop when the first value is positive". With a general target that is wrong.
- Ignoring overflow when translating to Java or C++.

## In the interview

- Say "this is 3Sum with one more loop", then go straight to the duplicate rules and overflow.
- Likely follow-ups:
  - *General `k`-sum?* Recurse: fix one value and solve `(k-1)`-sum on the rest, bottoming out at the two-pointer sweep. Time `O(n^(k-1))`.
  - *Count quadruplets across four separate arrays (4Sum II)?* Store all sums of pairs from the first two arrays in a map, then look up negated sums from the other two: `O(n²)`.
