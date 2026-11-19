**Key idea:** if a capacity is enough to ship everything in `days` days, any larger capacity is too. So binary search the capacity between the heaviest package and the total weight, checking each candidate by loading the ship greedily in order and counting the days it takes.

## Recognising the pattern

"Smallest value that makes something possible", with an easy check for any given value and a monotone yes/no answer, is **binary search on the answer** from the [Binary Search](/problems/patterns/binary-search) sheet. It is the same shape as Koko Eating Bananas; only the check changes.

## Brute force

Try capacities from the heaviest package upward and return the first one whose greedy day count fits. That is the reference brute force below.

Correct because it returns the first capacity that works. Each check is `O(n)`, and up to `sum − max` capacities may be tried, so time is `O(n · sum)`. Space `O(1)`.

## Optimal: binary search on capacity

**The check (greedy loading).** Fill today's ship with packages in order until the next one doesn't fit, then start a new day. Greedy is optimal for a fixed capacity: putting a package on an earlier day never makes later days worse.

**The range.** The capacity must be at least the heaviest package, or that package can never ship. A capacity equal to the total weight ships everything in one day, so it always works.

1. `lo = max(weights)`, `hi = sum(weights)`.
2. While `lo < hi`:
   1. `mid = lo + floor((hi − lo) / 2)`.
   2. If `daysNeeded(mid) <= days`, `hi = mid` (it works; maybe smaller does).
   3. Otherwise `lo = mid + 1`.
3. Return `lo`.

## Walkthrough

`weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`, `days = 5`. Range `[10, 55]`.

| lo | hi | mid | greedy loads | days | fits? |
| --- | --- | --- | --- | --- | --- |
| 10 | 55 | 32 | [1..7] [8,9,10] | 2 | yes → hi = 32 |
| 10 | 32 | 21 | [1..6] [7,8] [9,10] | 3 | yes → hi = 21 |
| 10 | 21 | 15 | [1..5] [6,7] [8] [9] [10] | 5 | yes → hi = 15 |
| 10 | 15 | 12 | [1..4] [5,6] [7] [8] [9] [10] | 6 | no → lo = 13 |
| 13 | 15 | 14 | [1..4] [5,6] [7] [8] [9] [10] | 6 | no → lo = 15 |

Answer `15`.

## Complexity

- Brute force: time `O(n · (sum − max))`, space `O(1)`.
- Binary search: time `O(n · log(sum))`, space `O(1)`.

## Edge cases

- `days` equal to the number of packages: one package per day, so the answer is the heaviest package.
- `days = 1`: the answer is the total weight.
- All packages equal: the answer is `weight · ceil(n / days)`.

## Common mistakes

- Starting `lo` at 1 instead of the heaviest package; the check would then need to handle packages that never fit.
- Starting a new day with `load = weight` and also counting it again, or forgetting to add it.
- Reordering packages. The order is fixed.

## In the interview

- Say "binary search on the answer", name the range and why, then write the greedy check as a separate function.
- Likely follow-ups:
  - *Split an array into `k` pieces minimising the largest sum?* The same problem in different words (Split Array Largest Sum).
  - *Packages can be reordered?* It becomes bin packing, which is NP-hard; heuristics or DP for small inputs.
