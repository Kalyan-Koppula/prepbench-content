**Key insight:** advance the index by `size` and `slice(i, i + size)`; `slice` clamps the end, so the short last chunk needs no special case.

## Approach

1. Validate `size` with `Number.isInteger(size) && size >= 1`.
2. `for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size))`.

## Walkthrough

`chunk([1, 2, 3, 4, 5], 2)`:

| `i` | Slice | Output so far |
| --- | --- | --- |
| 0 | `[1, 2]` | `[[1, 2]]` |
| 2 | `[3, 4]` | `[[1, 2], [3, 4]]` |
| 4 | `[5]` | `[[1, 2], [3, 4], [5]]` |

The loop steps by `size`; `slice` handles the short last chunk automatically because it stops at the array's end.

## Complexity

`O(n)` time and space.

## Edge cases to test

- Length divisible by `size`, and not.
- `size` larger than the array: one chunk.
- Empty array: `[]`.
- Invalid sizes (0, negative, fractional) throw a `RangeError`.
- The input isn't mutated.

## Pitfalls

- `size = 0` makes `i += size` loop forever. That's why the validation is not optional.
- `size = 1.5` gives indices 0, 1.5, 3...; `slice` truncates them and you get overlapping or odd chunks.
- `splice` in a loop is O(n²) and mutates the caller's array.
- Returning `[array]` when it fits in one chunk hands back the caller's own array.

## Follow-ups interviewers add

- **Generator version:** `function* chunks(iterable, size)` that works on streams without building everything in memory.
- **Chunk by predicate** or by a running total (batch requests up to 1 MB each).
- **Run batches with limited concurrency:** combine `chunk` with `Promise.all` per batch, then discuss why a pool is better.
- **Typed tuples:** in TypeScript, type `chunk` so that a literal tuple produces typed chunks.

## In the interview

Clarify invalid-size behaviour first (throw, or return `[]` like lodash), then write the three-line loop. A follow-up is a generator version that yields chunks lazily for large inputs.
