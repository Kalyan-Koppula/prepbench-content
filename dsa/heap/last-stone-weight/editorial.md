**Key insight:** this is a direct simulation that always needs the current maximum twice — exactly what a max-heap is for.

## Approach

1. Push every weight into a max-heap.
2. While at least two stones remain, pop `y` (heaviest) and `x` (next). If `y > x`, push `y - x` back.
3. Return the remaining stone's weight, or `0` if the heap is empty.

## Complexity

- Time `O(n log n)`: each round removes at least one stone, so there are at most `n - 1` rounds of `O(log n)` work.
- Space `O(n)` for the heap.

## Alternatives to mention

- Re-sort the array every round: `O(n² log n)`. Fine for tiny inputs, but the heap is the expected answer.
- Since weights are bounded (`<= 1000`), a bucket count by weight also works in `O(n + W)`.

## Pitfalls

- Pushing a `0` back when the stones are equal — harmless for the answer but wastes rounds; skip it.
- Returning `undefined` from an empty heap instead of `0`.
