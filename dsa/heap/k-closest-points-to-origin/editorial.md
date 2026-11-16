**Key insight:** this is top-k by distance. Keep the `k` closest points in a **max**-heap keyed by squared distance, so the worst of the current best is always on top and easy to evict.

## Approach

1. Compare by `x² + y²` — monotonic in the true distance, and exact in integers.
2. For each point, push it; if the heap holds more than `k`, pop the farthest.
3. The heap's contents are the answer (order doesn't matter).

## Complexity

- Time `O(n log k)`.
- Space `O(k)`.

## Alternatives to mention

- Sort all points by distance and take the first `k`: `O(n log n)`, simplest to write.
- Quickselect on distance: `O(n)` average, `O(n²)` worst case, in place. A strong answer when `k` is close to `n` or the interviewer asks for better than `n log k`.
- A min-heap of all `n` points, popping `k` times: `O(n + k log n)` with bottom-up heapify.

## Pitfalls

- Using a min-heap of size `k` — it evicts the *closest* point instead of the farthest.
- `Math.sqrt` is unnecessary and introduces floating-point noise.
