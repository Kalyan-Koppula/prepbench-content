**Key insight:** one pass, one lookup per item. The interesting parts are the edges: normalising `by`, and choosing a result object that has no inherited keys.

## Approach

1. Turn `by` into a function: if it's a string, use `item => item[by]`.
2. Create `groups = Object.create(null)`.
3. Loop with `for...of` (works for any iterable) and a manual index. Compute `String(key)` and push into `groups[key] ??= []`.

## Walkthrough

`groupBy([6.1, 4.2, 6.3], Math.floor)`:

| Item | Key | Groups |
| --- | --- | --- |
| 6.1 | `'6'` | `{ 6: [6.1] }` |
| 4.2 | `'4'` | `{ 6: [6.1], 4: [4.2] }` |
| 6.3 | `'6'` | `{ 6: [6.1, 6.3], 4: [4.2] }` |

Keys are converted to strings because object keys are strings. The result has a `null` prototype, so a key like `'constructor'` or `'__proto__'` is just an ordinary group.

## Complexity

`O(n)` time and space.

## Edge cases to test

- A function key and a property-name key.
- Items keep their order within each group.
- Keys that collide with `Object.prototype` names.
- Any iterable input.

## Pitfalls

- With `{}` as the result, `groups['toString']` is already a function, so `groups[k] || (groups[k] = [])` returns it and `.push` throws. `groups['__proto__'] = []` changes the object's prototype instead of adding a key.
- `items.forEach` or `items.reduce` only work on arrays; a `Set` or generator breaks.
- Forgetting the index argument, or passing the index from a different counter after filtering.
- Integer-like keys (`'1'`, `'2'`) are always listed first and in numeric order by `Object.keys`, whatever order you inserted them. Use a `Map` if order matters.

## Follow-ups interviewers add

- **`groupToMap`:** return a `Map` so keys can be objects and keep insertion order (like `Map.groupBy`).
- **`countBy`** and **`keyBy`** (last item wins) variants.
- **Group by several keys** at once (`groupBy(rows, ['country', 'city'])` producing nested groups).
- **TypeScript:** type the property-name shorthand as `K extends keyof T`.

## In the interview

Mention the built-ins: `Object.groupBy` (string keys, null-prototype result) and `Map.groupBy` (any key type, keeps keys like objects distinct).
