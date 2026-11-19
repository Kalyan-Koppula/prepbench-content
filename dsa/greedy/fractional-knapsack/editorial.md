**Key idea:** when items can be cut, the best use of each unit of capacity is the item with the highest **value per unit of weight**. Sort by that ratio, take whole items while they fit, and take a fraction of the next one to fill the remaining capacity exactly.

## Recognising the pattern

Filling a capacity where items can be split is the textbook case where greedy works, from the [Greedy](/problems/patterns/greedy) sheet. Compare it with the [0/1 Knapsack](/problems/knapsack-0-1), where items can't be split and greedy by ratio fails, so DP is needed.

## Brute force

Without splitting, you would try subsets. With splitting, the problem is a linear program, and the greedy is exactly its optimal solution, so there is no simpler brute force worth writing. There is no reference brute force for this problem.

## Greedy by ratio

1. Sort item indices by `value / weight`, highest first. To avoid division, compare `values[b] · weights[a]` with `values[a] · weights[b]`.
2. `room = capacity`, `total = 0`.
3. For each item while `room > 0`:
   - If it fits entirely, add its full value and subtract its weight.
   - Otherwise add `value · room / weight` and stop.
4. Return `total`.

**Why greedy is optimal.** Suppose an optimal load uses some weight of a lower-ratio item while a higher-ratio item isn't fully taken. Swapping a small amount of weight from the first to the second keeps the weight the same and increases the value. So in an optimal load, every higher-ratio item is used fully before any lower-ratio item.

## Walkthrough

`values = [30, 40, 45]`, `weights = [10, 20, 15]`, `capacity = 30`. Ratios: 3, 2, 3.

| item (ratio) | weight | room before | taken | total |
| --- | --- | --- | --- | --- |
| 0 (3) | 10 | 30 | all | 30 |
| 2 (3) | 15 | 20 | all | 75 |
| 1 (2) | 20 | 5 | 5/20 | 75 + 10 = 85 |

Answer `85`.

## Complexity

- Sort plus one pass: `O(n log n)` time, `O(n)` space for the index order.
- Selecting by ratio without full sorting (a quickselect-style method) gives `O(n)`, rarely needed.

## Edge cases

- Everything fits: the total value of all items.
- Capacity smaller than every item: a fraction of the best-ratio item.
- Fractional results: return a floating-point value (for example 1.75).

## Common mistakes

- Sorting by value or by weight alone.
- Using integer division for the fractional part.
- Applying this greedy to the 0/1 knapsack, where it is wrong.

## In the interview

- Contrast with the 0/1 version immediately; it shows you know why greedy works here and fails there.
- Likely follow-ups:
  - *Items can't be split?* 0/1 knapsack DP.
  - *Items are unlimited and splittable?* Take only the best-ratio item.
