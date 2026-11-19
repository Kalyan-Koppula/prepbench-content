**Key idea:** turn signs into a subset. The numbers with a plus sign sum to `P`, the rest to `total − P`, and you need `P − (total − P) = target`, so `P = (total + target) / 2`. The answer is the number of subsets summing to that `P`, a 0/1 knapsack count.

## Recognising the pattern

Assigning `+` or `−` to each number is a choice per item with a sum constraint: knapsack territory from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. The algebra removes negative sums entirely, so the table only needs indices `0 … P`.

## Brute force

Try both signs for every number recursively and count the assignments that hit the target. That is the reference brute force below. `O(2^n)` time and `O(n)` depth; fine for `n ≤ 20`, which is this problem's limit, but it doesn't scale.

## Count subsets with sum P

1. Compute `total`. If `|target| > total` or `total + target` is odd, return 0: `P` must be a whole number between 0 and `total`.
2. `goal = (total + target) / 2`; `count[0] = 1`.
3. For each number `x`: for `s` from `goal` down to `x`: `count[s] += count[s − x]`.
4. Return `count[goal]`.

**Why downward.** `count[s − x]` must still count subsets **without** `x`. Going down, smaller sums haven't been updated for `x` yet. (This is the one-row version of `count[i][s] = count[i − 1][s] + count[i − 1][s − x]`.)

**Zeros.** A zero can be `+0` or `−0`, giving two different assignments. The update `count[s] += count[s − 0]` doubles every count, which is exactly right.

## Walkthrough

`nums = [2, 1, 1]`, `target = 2`: `total = 4`, `goal = 3`.

| after number | count[0] | count[1] | count[2] | count[3] |
| --- | --- | --- | --- | --- |
| – | 1 | 0 | 0 | 0 |
| 2 | 1 | 0 | 1 | 0 |
| 1 | 1 | 1 | 1 | 1 |
| 1 | 1 | 2 | 2 | 2 |

Answer `2`: plus-sets `{2, first 1}` and `{2, second 1}`, that is `+2 +1 −1` and `+2 −1 +1`.

## Complexity

- All sign assignments: `O(2^n)`.
- Memoised recursion on `(index, running sum)`: `O(n × total)` with an offset for negative sums.
- Subset count: `O(n × goal)` time, `O(goal)` space.

## Edge cases

- Target out of reach (`|target| > total`): 0.
- Odd `total + target`: 0.
- Zeros: each doubles the count.
- Negative target: the formula works unchanged; by symmetry the answer equals that for `−target`.

## Common mistakes

- Forgetting the parity and range checks, leading to fractional or negative indices.
- Iterating sums upward, which reuses numbers.
- Treating `+0` and `−0` as one assignment.

## In the interview

- Show the algebra first; it is the insight the interviewer is looking for.
- Likely follow-ups:
  - *Without the algebra?* DP over `(index, running sum)` with sums shifted by `total` so indices stay non-negative.
  - *Minimise `|sum|` instead (Last Stone Weight II)?* Find the reachable subset sum closest to `total / 2`.
