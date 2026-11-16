**Key insight:** split the stream into a lower half (max-heap) and an upper half (min-heap) of nearly equal size. The median is always at the top of one or both heaps.

## Approach

Invariants: every value in `low` is `<=` every value in `high`, and `low.size()` is equal to `high.size()` or one more.

1. `addNum(x)`: push `x` into `low`, then move `low`'s max into `high`. This guarantees the ordering invariant no matter where `x` belongs.
2. If `high` is now bigger than `low`, move `high`'s min back to `low` to restore the size invariant.
3. `findMedian`: odd count → `low.peek()`; even count → average of both tops.

## Complexity

- `addNum`: `O(log n)` — a constant number of heap operations.
- `findMedian`: `O(1)`.
- Space `O(n)`.

## Alternatives to mention

- Sorted array with binary-search insertion: `O(log n)` to find the spot but `O(n)` to shift — fine for small streams.
- Re-sorting on every query: `O(n log n)` per `findMedian`.
- A balanced BST / order-statistics tree gives `O(log n)` for both, and supports deletions (needed for a *sliding-window* median).

## Follow-ups

- **Values in `[0, 100]`:** keep a count array of 101 buckets; `addNum` is `O(1)`, `findMedian` walks at most 101 buckets.
- **Mostly in range:** buckets for the common range plus two heaps (or counters) for outliers on either side.

## Pitfalls

- Checking only sizes and forgetting the ordering invariant (e.g. pushing straight into the smaller heap).
- Integer division: in JS `/` already gives a fraction — don't wrap it in `Math.floor`.
