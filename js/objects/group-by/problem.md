---
title: Group By
difficulty: Easy
order: 9
tags: [arrays, objects, iteration]
frequency: medium
exports: [groupBy]
hints:
  - Normalise the second argument into a function first, so the loop only has one case.
  - Create each group's array the first time you see its key.
  - Some keys, like `toString` or `__proto__`, already mean something on a normal `{}`.
---

Implement `groupBy(items, by)`, which sorts items into buckets keyed by a computed value. It mirrors the built-in `Object.groupBy`, plus a shorthand for property names.

```js
const files = [
  { name: 'a.ts', ext: 'ts' },
  { name: 'b.css', ext: 'css' },
  { name: 'c.ts', ext: 'ts' },
]
groupBy(files, 'ext')
// { ts: [a.ts, c.ts], css: [b.css] }
groupBy([1.2, 1.8, 2.5], Math.floor)
// { 1: [1.2, 1.8], 2: [2.5] }
```

## Notes

- `by` is either a function called as `by(item, index)`, or a property name (a string), meaning `item => item[by]`.
- Keys are converted to strings, as object keys always are (`1`, `true`, `undefined` become `'1'`, `'true'`, `'undefined'`).
- Items keep their original order inside each group.
- `items` can be any iterable (an array, a `Set`, a generator).
- Return an object with a **`null` prototype**, as `Object.groupBy` does, so that any key works as a group name, including `'toString'` and `'__proto__'`.
- Don't use `Object.groupBy` itself.
