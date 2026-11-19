**Key insight:** flattening is a depth-limited tree walk. Recurse into an element only if it's an array *and* you still have depth left; everything else is pushed as is.

## Approach

1. Normalize depth: `undefined` → 1, `NaN` → 0. Negative depths behave like 0 because the "depth > 0" check never passes.
2. Create `out = []` and a recursive `walk(source, level)`:
   - for each index, skip holes with `i in source`;
   - if `level > 0 && Array.isArray(item)`, `walk(item, level - 1)`;
   - else `out.push(item)`.
3. `walk(this, depth)` and return `out`.

Iterative version: a stack of `[array, index, level]` frames, useful when nesting is deep enough to overflow the call stack.

## Walkthrough

`[1, [2, [3]], , 4].myFlat()` (default depth 1, index 2 is a hole):

| Item | Level | Action |
| --- | --- | --- |
| `1` | 1 | push |
| `[2, [3]]` | 1 | walk with level 0 |
| `2` | 0 | push |
| `[3]` | 0 | push the array |
| hole | – | skipped |
| `4` | 1 | push |

Result: `[1, 2, [3], 4]`. `myFlat(Infinity)` flattens everything; `myFlat(0)` makes a shallow copy without holes.

## Complexity

`O(n)` for `n` total elements.

## Edge cases to test

- Default depth 1, depth 0, `Infinity`.
- Holes removed at every level.
- `NaN` depth treated as 0.
- Non-array objects with `length` aren't flattened.

## Pitfalls

- `reduce` + `concat` with spread on every level: correct but O(n × depth) copying; and `concat` flattens one level on its own, which hides bugs.
- `item instanceof Array` misses arrays from other frames; `Array.isArray` doesn't.
- `for…of` or `forEach`-free loops that read `arr[i]` on holes and push `undefined`.
- `depth || 1` turns an explicit `0` into 1.
- Flattening strings because they have a `length`.

## Follow-ups interviewers add

- **Iterative flat** with an explicit stack (no recursion limit).
- **`flatMap`:** map, then flatten exactly one level.
- **Generator version:** `function* flatten(arr, depth)` yields lazily.
- **Deep flatten of objects** into `{ 'a.b.c': value }` keys.

## In the interview

Mention the iterative version for very deep arrays (a stack avoids recursion limits) and `flatMap` as `map` followed by `flat(1)`.
