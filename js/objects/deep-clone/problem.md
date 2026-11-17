---
title: Deep Clone
difficulty: Easy
order: 1
tags: [recursion, objects, arrays]
frequency: high
exports: [deepClone]
hints:
  - Primitives can be returned as they are; only objects and arrays need copying.
  - Build a fresh container of the same kind, then fill it by cloning each value recursively.
  - Watch out for `typeof null === 'object'`.
---

Implement `deepClone(value)`, which returns a copy of JSON-like data: plain objects, arrays and primitives, nested to any depth. Changing anything in the copy must never change the original.

```js
const settings = { theme: 'dark', panels: [{ id: 'files', open: true }] }
const copy = deepClone(settings)
copy.panels[0].open = false
settings.panels[0].open // still true
```

## Notes

- Primitives (`string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`) are returned unchanged.
- Arrays become new arrays; every other object becomes a new **plain** object holding copies of its **own enumerable** string keys. Inherited properties are not copied.
- Functions are not copied; the clone points at the same function.
- You can assume there are no cycles and no special objects (`Date`, `Map`, ...). The follow-up question handles those.
