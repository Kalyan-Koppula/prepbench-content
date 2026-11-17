---
title: Pick and Omit
difficulty: Medium
order: 14
tags: [objects, immutability]
frequency: medium
exports: [pick, omit]
hints:
  - Use `Object.prototype.hasOwnProperty` for "does this key exist", not `obj[key] !== undefined` and not `in`.
  - "For a deep `pick`, check that the whole path exists before you create anything in the result."
  - "For a deep `omit`, copy only the objects on the path to the removed key; everything else can be reused."
---

Implement two helpers for shaping objects, the runtime twins of TypeScript's `Pick` and `Omit`:

- `pick(obj, paths)` returns a new object with only the listed keys.
- `omit(obj, paths)` returns a new object with everything **except** the listed keys.

```js
const user = { id: 7, name: 'Ada', password: 'x', profile: { bio: 'hi', secret: 's' } }
pick(user, ['id', 'name'])              // { id: 7, name: 'Ada' }
omit(user, ['password'])                // { id: 7, name: 'Ada', profile: { bio: 'hi', secret: 's' } }
pick(user, ['id', 'profile.bio'])       // { id: 7, profile: { bio: 'hi' } }
omit(user, ['password', 'profile.secret'])
// { id: 7, name: 'Ada', profile: { bio: 'hi' } }
```

## Notes

- Paths may contain dots to reach into nested objects. Each dot step must be an **own** property holding an object; otherwise the path doesn't exist.
- Only **own** properties count. Inherited properties are never picked and never appear in `omit`'s result.
- `pick` skips paths that don't exist; it never creates keys (or empty parent objects) for them. An own key whose value is `undefined` does exist and is picked.
- `omit` ignores paths that don't exist. It copies only the objects on the way to a removed key; untouched nested objects are shared with the input.
- Values are copied by reference. Never mutate the input.
- You can assume no path is a prefix of another in the same call (`['a', 'a.b']` won't happen).
