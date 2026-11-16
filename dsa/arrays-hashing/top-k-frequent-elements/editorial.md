**Key insight:** frequencies are bounded by `n`, so instead of sorting by frequency you can drop each value into bucket `freq` and read buckets from high to low — linear time.

## Approach

1. Count occurrences in a `Map<value, freq>`.
2. Create `n + 1` buckets; push each value into `buckets[freq]`.
3. Walk buckets from `n` down to `1`, collecting values until you have `k`.

## Complexity

- Time `O(n)` — counting, bucketing and the scan are each linear.
- Space `O(n)` — the map and the buckets.

## Alternatives to mention

- Sort the distinct values by frequency: `O(n log n)` — fine to start with, then improve.
- Min-heap of size `k` keyed by frequency: `O(n log k)`. Best when `k` is much smaller than the number of distinct values or the input is a stream. `PriorityQueue` is available here; interviewers may ask you to implement the heap yourself.
- Quickselect on the distinct values: `O(n)` average, `O(n²)` worst case.

## Pitfalls

- Bucket array needs size `n + 1` — a value can appear `n` times.
