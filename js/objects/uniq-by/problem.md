---
title: Unique By
difficulty: Easy
order: 11
tags: [arrays, set, iteration]
frequency: medium
exports: [uniqBy]
hints:
  - A `Set` of keys you've already seen gives you constant-time "have I kept one of these?" checks.
  - Compute each item's key exactly once.
---

Implement `uniqBy(array, by)`, which removes duplicates where "duplicate" means "has the same key". The **first** item with each key is kept.

```js
const events = [
  { id: 'a', at: 1 },
  { id: 'b', at: 2 },
  { id: 'a', at: 3 },
]
uniqBy(events, 'id')                  // [{ id: 'a', at: 1 }, { id: 'b', at: 2 }]
uniqBy([2.1, 1.5, 2.9], Math.floor)   // [2.1, 1.5]
```

## Notes

- `by` is either a function `item => key` or a property name (string), meaning `item => item[by]`.
- Keys are compared the way a `Set` compares values (SameValueZero): `NaN` matches `NaN`, `1` does **not** match `'1'`, and object keys match only the same reference.
- Items whose key is `undefined` count as having the same key, `undefined`.
- Keep the original order of the kept items. Return a new array; don't mutate the input.
- Call `by` once per item.
