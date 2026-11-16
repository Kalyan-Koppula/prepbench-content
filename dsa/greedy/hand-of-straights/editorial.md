**Key insight:** the smallest remaining card can't sit in the middle or end of a run (nothing smaller is left), so it must *start* one. That forced move makes the greedy correct.

## Approach

1. If `hand.length` isn't a multiple of `groupSize`, return `false` immediately.
2. Count occurrences of each value in a map; sort the distinct values.
3. For each value `start` in ascending order with `c = count[start] > 0`, open `c` runs at once: each of `start .. start + groupSize - 1` must have at least `c` copies; subtract `c` from each.
4. If any value falls short, return `false`; if the sweep finishes, return `true`.

Processing all `c` copies of `start` together avoids rescanning the same value `c` times.

## Complexity

- Time `O(n log n)` for sorting the distinct values. The sweep is `O(n)`: each start that isn't skipped consumes at least `groupSize` cards, so there are at most `n / groupSize` of them, each doing `groupSize` map updates.
- Space `O(n)` for the counts.

## Alternatives to mention

- Min-heap of distinct values: pop the smallest, walk forward; when a count hits zero it must be the heap top or the hand is invalid. Same complexity.
- Sorting the raw array and splicing out runs: `O(n²)` — fine as a first sketch.

## Follow-ups

- This is the same problem as "divide array into sets of `k` consecutive numbers".
