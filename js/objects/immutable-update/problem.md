---
title: Immutable Update
difficulty: Medium
order: 13
tags: [immutability, recursion, react, state]
frequency: medium
exports: [update]
hints:
  - A spec object either is a command (its single key starts with `$`) or describes which children to update. Handle the command case first.
  - For a normal spec, update each listed child recursively and only copy the parent if at least one child came back different.
  - Copy arrays as arrays and objects as objects, then overwrite just the changed keys.
---

React and Redux state must never be mutated: an update creates new objects along the changed path and **shares** everything else, so `===` checks (memo, selectors) can skip unchanged parts. Implement `update(state, spec)`, a small command language for that.

```js
const state = { user: { name: 'Ada', tags: ['admin'] }, settings: { theme: 'dark' } }
const next = update(state, {
  user: { name: { $set: 'Grace' }, tags: { $push: ['owner'] } },
})
// next.user is { name: 'Grace', tags: ['admin', 'owner'] }
// next.settings === state.settings   (untouched branch is shared)
// state is unchanged
```

## Notes

The spec mirrors the shape of the state. A spec object whose key starts with `$` is a **command** applied to the value at that position:

| Command | Effect |
|---|---|
| `{ $set: value }` | replace the value |
| `{ $push: [a, b] }` | new array with the items appended; the target must be an array |
| `{ $merge: { k: v } }` | new object with the keys shallow-merged in; the target must be a non-array object |
| `{ $apply: fn }` | replace the value with `fn(oldValue)` |

- Any other spec object lists children to update. Numeric keys update array items, and the copy of an array is an array.
- **Structural sharing:** only objects on a changed path are copied. If no child's value actually changes (compared with `Object.is`), return the original object itself.
- Never mutate `state` or `spec`.
- Throw an `Error` for an unknown command or a spec object that mixes a command with other keys. Throw a `TypeError` when `$push` or `$merge` gets the wrong kind of target, or when a nested spec points into something that isn't an object or array.
