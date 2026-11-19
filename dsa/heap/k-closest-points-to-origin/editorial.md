**Key idea:** keep the `k` closest points seen so far in a **max**-heap ordered by distance. The top is the farthest of them; whenever the heap grows past `k`, pop it. After all points, the heap holds the answer. Compare squared distances: the order is the same and no square roots are needed.

## Recognising the pattern

Top k by a computed key is the size-k heap template from the [Heap](/problems/patterns/heap) sheet. For the k **smallest** distances, the heap is a **max**-heap, whose top is the weakest member to evict.

## Brute force

Sort all points by distance and take the first `k`. That is the reference brute force below. Time `O(n log n)`, space `O(n)` for the sorted copy. Simple, and fine for one-off use; the heap is better when `k` is much smaller than `n` or the points arrive as a stream.

## Optimal: max-heap of size k

1. For each point, push it into a max-heap ordered by `x² + y²`.
2. If the heap holds more than `k` points, pop the farthest.
3. Return the points left in the heap.

**Why squared distance?** `√a < √b` exactly when `a < b` for non-negative numbers, so comparing `x² + y²` gives the same order as the real distance, with integer arithmetic and no rounding.

**Quickselect alternative.** Partition the points around a pivot distance, like quicksort, recursing only into the side that contains the kth position. Average `O(n)`, worst `O(n²)`, and it reorders the input.

## Walkthrough

`points = [[3, 3], [5, -1], [-2, 4]]`, `k = 2`

| point | squared distance | heap after (farthest first) |
| --- | --- | --- |
| [3, 3] | 18 | 18 |
| [5, −1] | 26 | 26, 18 |
| [−2, 4] | 20 | 26, 20, 18 → pop 26 → 20, 18 |

Answer `[[-2, 4], [3, 3]]` in any order.

## Complexity

- Sort: time `O(n log n)`, space `O(n)`.
- Size-k heap: time `O(n log k)`, space `O(k)`.
- Quickselect: average time `O(n)`, worst `O(n²)`, space `O(1)` extra beyond recursion.

## Edge cases

- `k = n`: every point is returned.
- Points with negative coordinates: squaring removes the sign.
- Duplicate points: kept as separate entries.

## Common mistakes

- Using a min-heap and keeping every point, which costs `O(n log n)` and `O(n)` space.
- Computing `Math.sqrt` and comparing floating-point values unnecessarily.
- Overflow of `x² + y²` in 32-bit languages for larger coordinates (here at most `2 · 10^8`, which fits).

## In the interview

- Mention sorting first, then the size-k heap, then quickselect if they push for linear time.
- Likely follow-ups:
  - *Points arrive as a stream?* The size-k heap works unchanged.
  - *Closest to a point other than the origin?* Subtract that point's coordinates first.
  - *k nearest neighbours for many queries?* Spatial structures such as k-d trees.
