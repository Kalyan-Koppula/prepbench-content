---
title: Object Diff
difficulty: Medium
order: 12
tags: [recursion, objects, comparison]
frequency: medium
exports: [diff]
hints:
  - Walk the union of both objects' keys at each level and classify each one.
  - Only descend when both sides are containers of the same kind; every other difference is reported at the current path.
  - "`Object.prototype.hasOwnProperty` tells \"missing\" apart from \"set to undefined\"."
---

Implement `diff(before, after)`, which reports what changed between two versions of some JSON-like state, as lists of dot paths. It's the core of an audit log, an "unsaved changes" banner or a form's dirty-field tracking.

```js
diff(
  { name: 'Ada', address: { city: 'London', zip: 'N1' }, tags: ['a'] },
  { name: 'Ada', address: { city: 'Paris' }, tags: ['a', 'b'], admin: true },
)
// {
//   added:   ['tags.1', 'admin'],
//   removed: ['address.zip'],
//   changed: ['address.city'],
// }
```

## Notes

- A path is the keys from the root joined with `.`; array items use their index (`'tags.1'`).
- **Containers** are arrays and plain objects (prototype `Object.prototype` or `null`).
- For every own key in either object:
  - only in `after`: **added**. Only in `before`: **removed**. Report the key itself, not the leaves inside it.
  - in both, and both values are plain objects, or both are arrays: recurse.
  - in both otherwise: **changed** if `Object.is(old, new)` is false. An object turning into an array (or a string) is one change at that path.
- A key whose value is `undefined` still exists: `{ a: undefined }` vs `{}` is a removal.
- The order of paths inside each list doesn't matter (the tests sort them).
- Both arguments are plain objects. Don't mutate them.
