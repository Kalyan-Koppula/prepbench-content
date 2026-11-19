**Key insight:** `map` is a counted loop over `0 … length - 1` that writes into a pre-sized array, and skips indices that don't exist (`i in arr`). That one `in` check is what makes holes behave.

## Approach

1. Validate `callback` before anything else.
2. `source = Object(this)`, `length` read once up front.
3. `result = new Array(length)`.
4. For each `i`, if `i in source`, set `result[i] = callback.call(thisArg, source[i], i, source)`.
5. Return `result`.

## Walkthrough

`[1, , 3].myMap((n) => n * 2)`:

| `i` | Hole? | Result slot |
| --- | --- | --- |
| 0 | no | `result[0] = 2` |
| 1 | yes | left empty: the hole is **preserved** |
| 2 | no | `result[2] = 6` |

Result: `[2, <empty>, 6]`, same length as the input. Unlike `filter`, `map` keeps the shape, including holes, because it writes by index into a pre-sized array.

## Complexity

`O(n)`.

## Edge cases to test

- Holes preserved in the output.
- Same length as the input.
- `thisArg` and the three callback arguments.
- Array-likes.

## Pitfalls

- `for (const x of this)` or `forEach` + `push`: holes get visited (or the result loses them), and `push` shifts later indices.
- Reading `this.length` in the loop condition: elements pushed by the callback get visited and the loop may never end.
- Calling `callback(x, i, arr)` without `thisArg`.
- Only throwing for a bad callback when there's something to iterate; the spec checks first.

## Follow-ups interviewers add

- **Species:** real `map` on a subclass of `Array` returns that subclass (`Symbol.species`).
- **`forEach`, `some`, `every`, `find`:** which ones skip holes? (`find`/`findIndex` don't.)
- **Typed arrays:** why does `Uint8Array.prototype.map` clamp the results?
- **Performance:** why do engines optimize the built-in better than this loop?

## In the interview

Point out the contrast with `filter` (pushes, so dense output) and why `new Array(length)` plus index assignment preserves holes.
