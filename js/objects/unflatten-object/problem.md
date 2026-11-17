---
title: Unflatten Object
difficulty: Medium
order: 7
tags: [objects, arrays, parsing]
frequency: medium
exports: [unflattenObject]
hints:
  - Split each key on `.` and walk down from the root, creating containers as you go, just like a `set` by path.
  - Look at the next segment to decide whether the missing container is an array or an object.
  - A conflict is any attempt to walk through a leaf, or to overwrite a container with a leaf.
---

Implement `unflattenObject(flat)`, the reverse of flattening: each key is a dot-separated path, and the result is the nested structure it describes.

```js
unflattenObject({
  'user.name': 'Ada',
  'user.langs.0': 'en',
  'user.langs.1': 'fr',
  active: true,
})
// { user: { name: 'Ada', langs: ['en', 'fr'] }, active: true }
```

## Notes

- Split keys on `.`. A segment made only of digits is an array index: when a container has to be **created** for it, create an array. Otherwise create a plain object.
- Values are stored as they are (by reference), including `{}`, `[]` and `null`.
- **Conflicts:** throw an `Error` when two keys disagree about a location, in either order:
  - `{ user: 'Ada', 'user.name': 'Ada' }`: `user.name` would have to go through the string `'Ada'`.
  - `{ 'user.name': 'Ada', user: 'Ada' }`: `user` would overwrite the object built for `user.name`.
- **Safety:** skip any key with a `__proto__`, `constructor` or `prototype` segment. The input may come from a query string.
- Return a new object; don't mutate `flat`.
