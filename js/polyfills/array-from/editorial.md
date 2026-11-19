**Key insight:** `Array.from` has two input protocols. Try the iterator protocol first (`Symbol.iterator`); only if there isn't one, fall back to the array-like protocol (`length` plus indices). `mapFn` is applied in both, while copying.

## Approach

1. Throw a `TypeError` for `null`/`undefined`, and for a `mapFn` that is present but not a function.
2. Box the source (`Object(source)`) so strings and numbers can be inspected.
3. If `obj[Symbol.iterator]` is a function, `for…of` over it, mapping each value with `mapFn.call(thisArg, value, index)`.
4. Otherwise normalize `length` (`Math.trunc(Number(len))`, clamp at 0, `NaN` → 0) and copy each index, mapping as you go.

## Walkthrough

Three inputs:

| Call | Path | Result |
| --- | --- | --- |
| `arrayFrom('héllo')` | strings are iterable | `['h', 'é', 'l', 'l', 'o']` |
| `arrayFrom(new Set([1, 1, 2]))` | iterable | `[1, 2]` |
| `arrayFrom({ length: 3 }, (_, i) => i * i)` | array-like: read indices 0..2 | `[0, 1, 4]` |

The iterator protocol is checked first; only objects without `Symbol.iterator` fall back to the `length` property.

## Complexity

`O(n)`.

## Edge cases to test

- Strings (including characters outside the basic multilingual plane, which iterate as one item).
- Sets, maps (entries), generators.
- Array-likes with and without values.
- `mapFn` and `thisArg`.
- `null`/`undefined` throw.

## Pitfalls

- `Array.prototype.slice.call(source)`: keeps holes and ignores iterables like `Set`.
- `str.split('')` for strings: breaks emoji and other astral characters into surrogate halves; the string iterator yields code points.
- Passing `mapFn` a third argument, or calling it after the copy with `.map` (which skips holes).
- Checking `length` first: an iterable with a `length` property (like a `NodeList` or a custom collection) must use its iterator.
- `new Array(length)` for array-likes and then `forEach`: the holes are never visited.

## Follow-ups interviewers add

- **`Array.of`:** why does it exist (`new Array(3)` vs `Array.of(3)`)?
- **`Array.fromAsync`:** accept async iterables and return a promise.
- **Subclassing:** `MyArray.from(...)` returns a `MyArray`; how does the real one do that (`this` as constructor)?
- **Huge lengths:** what happens with `{ length: 2 ** 32 }`?

## In the interview

The interesting decision is iterable versus array-like, and that iterating a string differs from indexing it (surrogate pairs). `Array.from({ length: n }, fn)` is a common idiom worth naming.
