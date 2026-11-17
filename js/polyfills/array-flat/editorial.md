**Key insight:** flattening is a depth-limited tree walk. Recurse into an element only if it's an array *and* you still have depth left; everything else is pushed as is.

## Approach

1. Normalize depth: `undefined` → 1, `NaN` → 0. Negative depths behave like 0 because the "depth > 0" check never passes.
2. Create `out = []` and a recursive `walk(source, level)`:
   - for each index, skip holes with `i in source`;
   - if `level > 0 && Array.isArray(item)`, `walk(item, level - 1)`;
   - else `out.push(item)`.
3. `walk(this, depth)` and return `out`.

Iterative version: a stack of `[array, index, level]` frames, useful when nesting is deep enough to overflow the call stack.

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
