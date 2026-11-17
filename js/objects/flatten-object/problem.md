---
title: Flatten Object
difficulty: Medium
order: 6
tags: [recursion, objects]
frequency: medium
exports: [flattenObject]
hints:
  - Recurse with the key prefix built so far; the leaf's full key is `prefix + '.' + key` (or just `key` at the top).
  - Decide up front what counts as a container to descend into, and treat everything else as a leaf.
  - An empty object or array has no leaves of its own, so it would vanish unless you store it as a value.
---

Implement `flattenObject(obj)`, which turns nested data into a single-level object whose keys are dot-separated paths. Array items use their index as the key.

```js
flattenObject({
  user: { name: 'Ada', langs: ['en', 'fr'] },
  active: true,
})
// { 'user.name': 'Ada', 'user.langs.0': 'en', 'user.langs.1': 'fr', active: true }
```

This is the format form libraries, i18n files and analytics payloads often use.

## Notes

- Descend into **arrays** and **plain objects** (prototype `Object.prototype` or `null`). Everything else is a leaf value: primitives, `null`, `undefined`, functions, `Date`s, class instances. Leaves are copied by reference.
- An **empty** object or array is kept as a value (`{ 'filters': {} }`) so no information is lost.
- Keys appear in depth-first order, following the input's key order.
- Do not mutate the input.
- The tests build dates with `window.Date`, the same `Date` constructor your code sees in the sandbox.
