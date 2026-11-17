**Key insight:** advance the index by `size` and `slice(i, i + size)`; `slice` clamps the end, so the short last chunk needs no special case.

## Approach

1. Validate `size` with `Number.isInteger(size) && size >= 1`.
2. `for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size))`.

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
