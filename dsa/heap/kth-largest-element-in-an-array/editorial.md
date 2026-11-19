**Key idea:** keep a min-heap of the `k` largest values seen so far; when it grows past `k`, pop the smallest. After the scan, the heap's top is the kth largest. Quickselect is the average-linear alternative.

## Recognising the pattern

kth order statistic on an array: the [Heap](/problems/patterns/heap) sheet's size-k template, or quickselect, the partition step of quicksort applied to one side only. The follow-up "without sorting the whole array" is asking for one of these.

## Brute force

Sort a copy in descending order and return index `k − 1`. That is the reference brute force below. Time `O(n log n)`, space `O(n)` for the copy.

## Optimal option 1: min-heap of size k

1. For each value, push it; if the heap holds more than `k` values, pop the smallest.
2. Return the top.

The heap always holds the `k` largest values seen, so its minimum is the kth largest. Time `O(n log k)`, space `O(k)`.

## Optimal option 2: quickselect

1. Pick a pivot (randomly, to avoid bad cases) and partition the array so larger values come first.
2. If the pivot lands at index `k − 1`, it is the answer. If it lands after, recurse into the left part; before, into the right part.

Each step discards one side, so the expected work is `n + n/2 + n/4 + … = O(n)`. The worst case, with consistently bad pivots, is `O(n²)`. Random pivots make that unlikely, and the "median of medians" pivot makes it impossible, at a high constant cost.

## Walkthrough

`nums = [3, 2, 1, 5, 6, 4]`, `k = 2`, heap approach:

| value | heap after (min first) |
| --- | --- |
| 3 | 3 |
| 2 | 2, 3 |
| 1 | 2, 3 (1 popped) |
| 5 | 3, 5 (2 popped) |
| 6 | 5, 6 (3 popped) |
| 4 | 5, 6 (4 popped) |

Answer `5`.

## Complexity

- Sort: time `O(n log n)`, space `O(n)` (or `O(1)` in place).
- Size-k heap: time `O(n log k)`, space `O(k)`.
- Quickselect: average time `O(n)`, worst `O(n²)`; `O(1)` extra space when partitioning in place.

## Edge cases

- `k = 1`: the maximum. `k = n`: the minimum.
- Duplicates count separately: in `[3, 3, 1]`, the 2nd largest is 3.
- All values equal: every approach returns that value. Quickselect needs a three-way partition to avoid quadratic time here.

## Common mistakes

- A max-heap of all values, popped `k` times: correct but `O(n + k log n)` with `O(n)` space; fine, but say so.
- Quickselect with the first element as a fixed pivot on sorted input: quadratic.
- Treating `k` as 0-based.

## In the interview

- Offer sort, then the heap (`O(n log k)`), then quickselect (average `O(n)`) and discuss the worst case.
- Likely follow-ups:
  - *Stream instead of an array?* The heap works online; quickselect doesn't (Kth Largest Element in a Stream).
  - *Values in a small range?* Counting sort: count each value and walk down from the top.
