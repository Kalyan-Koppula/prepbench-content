**Key insight:** same skeleton as `map` (fixed length, `i in arr` check, `callback.call(thisArg, …)`), but the result is built with `push`, so it is dense by construction.

## Approach

1. Validate `callback`.
2. `source = Object(this)`, read `length` once.
3. Loop `i` from `0` to `length - 1`; skip when `!(i in source)`.
4. Read the value, call the callback, and push the value if the result is truthy.

## Walkthrough

`[5, , 12, 8].myFilter((n) => n > 6)` (index 1 is a hole):

| `i` | `i in source`? | Value | Callback | Result |
| --- | --- | --- | --- | --- |
| 0 | yes | 5 | false | `[]` |
| 1 | **no** (hole) | – | not called | `[]` |
| 2 | yes | 12 | true | `[12]` |
| 3 | yes | 8 | true | `[12, 8]` |

The length is read **once** at the start, so elements pushed by the callback aren't visited. The result is dense: holes never appear in it.

## Complexity

`O(n)` calls to the callback.

## Edge cases to test

- Holes are skipped.
- `thisArg` is used as `this` in the callback.
- The callback receives `(value, index, array)`.
- Works on array-likes (`myFilter.call({ length: 2, 0: 'a', 1: 'b' }, …)`).
- A non-function callback throws a `TypeError`.

## Pitfalls

- `if (arr[i])` instead of `i in arr`: real `undefined` and other falsy values get dropped as if they were holes.
- Comparing the callback result with `=== true`: `filter` keeps anything truthy.
- Reading `arr[i]` *again* after the callback to push it: if the callback changed the element, you keep the new value instead of the one that was tested.
- Looping until the live `length` when the callback appends.

## Follow-ups interviewers add

- **`reject`:** keep elements where the callback is falsy.
- **`partition`:** return `[kept, rejected]` in one pass.
- **`filter` with an async predicate:** run predicates in parallel and keep order (`Promise.all` then filter).
- **Build `filter` from `reduce`,** and discuss readability.

## In the interview

Name the spec details you're matching (length read once, holes skipped, `thisArg`, array-likes). Interviewers usually care about holes and `this` more than full spec compliance.
