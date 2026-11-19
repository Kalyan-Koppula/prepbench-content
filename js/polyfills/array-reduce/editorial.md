**Key insight:** almost all of `reduce`'s difficulty is choosing the starting accumulator. Decide "was an initial value passed?" by argument count, and when it wasn't, the first *existing* element is the seed.

## Approach

1. Validate `callback`; read `length` once.
2. If an initial value was passed (`arguments.length >= 2`, or a rest parameter's length), `acc = initialValue`, start at `i = 0`.
3. Otherwise advance `i` past holes; if you run off the end, throw a `TypeError`. Else `acc = arr[i]` and start at `i + 1`.
4. Loop to `length`, skipping holes: `acc = callback(acc, arr[i], i, arr)`.
5. Return `acc`.

## Walkthrough

`[, 2, 3].myReduce((acc, n) => acc + n)` (no initial value, index 0 is a hole):

| Step | `i` | Action | `acc` |
| --- | --- | --- | --- |
| find start | 0 | hole, skip | – |
| find start | 1 | first present element becomes `acc` | 2 |
| loop | 2 | `2 + 3` | 5 |

With an initial value, the loop starts at index 0 and the first element goes through the callback. Using a rest parameter (`...initial`) distinguishes "no initial value" from an explicit `undefined`.

## Complexity

`O(n)`.

## Edge cases to test

- With and without an initial value.
- An explicit `undefined` initial value counts as provided.
- Empty array without an initial value throws a `TypeError`.
- Holes skipped, including leading holes.
- The callback receives `(acc, value, index, array)`.

## Pitfalls

- `initialValue === undefined` as "not given": `reduce(fn, undefined)` then skips the first element.
- Using `arr[0]` as the seed without checking holes: `[, 1, 2]` would start from `undefined`.
- Returning `undefined` for an empty array instead of throwing.
- Calling the callback once for a one-element array with no initial value.

## Follow-ups interviewers add

- **`reduceRight`:** same logic scanning from the end.
- **Implement `map`, `filter`, `flat`, `groupBy` with `reduce`**, and when that hurts readability or performance (spreading the accumulator makes it O(n²)).
- **Async reduce:** run an async callback in sequence (`acc` is a promise).
- **`pipe` with reduce:** compose functions left to right.

## In the interview

The two subtle points are the empty-array error and distinguishing an explicit `undefined`. Mention `reduceRight` as the mirror image.
