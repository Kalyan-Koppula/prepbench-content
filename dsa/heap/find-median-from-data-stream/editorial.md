**Key idea:** split the numbers into a smaller half and a larger half. Keep the smaller half in a max-heap and the larger half in a min-heap, with the sizes equal or the smaller half one bigger. The median is then right at the tops: the smaller half's maximum, or the average of both tops.

## Recognising the pattern

A running order statistic over a stream is the two-heap template from the [Heap](/problems/patterns/heap) sheet. Each heap gives fast access to the boundary value on its side of the median, and inserts stay `O(log n)`.

## Brute force

Keep the numbers in a sorted array, inserting each new number in place. `findMedian` reads the middle in `O(1)`, but each insert shifts elements, `O(n)`. That is the reference brute force below. (Appending and sorting on every query is worse: `O(n log n)` per median.)

## Optimal: two heaps

- `low`: max-heap with the smaller half.
- `high`: min-heap with the larger half.
- Invariants: every value in `low` ≤ every value in `high`, and `low.size()` equals `high.size()` or is one larger.

`addNum(num)`:

1. Push `num` into `low`.
2. Move `low`'s maximum into `high`. This keeps the ordering invariant: the largest of the lower half (including the new number) goes up.
3. If `high` is now bigger than `low`, move `high`'s minimum back into `low`.

`findMedian()`:

- Odd count (`low` bigger): `low.peek()`.
- Even count: `(low.peek() + high.peek()) / 2`.

Routing every number through both heaps costs a few extra operations but avoids special cases about which side a number belongs on.

## Walkthrough

Add 5, 15, 1, 3:

| add | low (max-heap) | high (min-heap) | median |
| --- | --- | --- | --- |
| 5 | 5 | – | 5 |
| 15 | 5 | 15 | 10 |
| 1 | 1, 5 | 15 | 5 |
| 3 | 1, 3 | 5, 15 | 4 |

## Complexity

- Sorted array: `addNum` `O(n)`, `findMedian` `O(1)`.
- Two heaps: `addNum` `O(log n)`, `findMedian` `O(1)`. Space `O(n)`.

## Edge cases

- One number: it is the median.
- Duplicates: the ordering invariant uses `≤`, so equal values can sit in either heap.
- Negative numbers: no special handling.
- Even counts produce fractional medians: return a floating-point average.

## Common mistakes

- Letting the heaps' sizes drift apart by more than one.
- Putting a number directly into the heap that "looks right" without rebalancing, which breaks the ordering invariant.
- Integer division for the average in typed languages.

## In the interview

- Draw the two halves around the median before coding.
- Likely follow-ups:
  - *All numbers in `[0, 100]`?* Keep a count per value and walk the counts to the middle: `O(1)` insert, `O(101)` median.
  - *99% of numbers in `[0, 100]`?* Counts for the range plus two small heaps or lists for the outliers.
  - *Median of a sliding window?* Two heaps with lazy deletion, or a balanced BST.
