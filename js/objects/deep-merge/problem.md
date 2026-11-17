---
title: Deep Merge
difficulty: Medium
order: 8
tags: [recursion, objects, security]
frequency: high
exports: [deepMerge]
hints:
  - Build a brand-new result object and merge each source into it in turn.
  - Only recurse when the incoming value is a plain object; every other value simply replaces what is there.
  - Filter out the dangerous keys before you read or write anything.
---

Implement `deepMerge(...sources)`, which combines any number of objects into a **new** object. Nested plain objects are merged key by key; later sources win on conflicts. Think of layering user settings over defaults.

```js
const defaults = { theme: { mode: 'light', accent: 'blue' }, plugins: ['git'] }
const user = { theme: { mode: 'dark' }, plugins: ['vim'] }
deepMerge(defaults, user)
// { theme: { mode: 'dark', accent: 'blue' }, plugins: ['vim'] }
```

## Notes

- A **plain object** has prototype `Object.prototype` or `null`. Only plain objects are merged recursively.
- **Arrays are replaced, not concatenated**: the later array wins. Arrays, `Date`s, class instances and functions are copied by reference.
- A value that is `undefined` in a source does **not** overwrite an existing value. `null` does.
- If one side is a plain object and the other is not, the later value replaces the earlier one.
- Never mutate any source. Every plain object in the result is a new object, even branches that came from only one source, so editing the result can't reach the inputs.
- `null` and `undefined` sources are skipped.
- **Safety:** skip the keys `__proto__`, `constructor` and `prototype`, wherever they appear. Sources may come from `JSON.parse`, which creates `__proto__` as an ordinary own key.
- The tests build dates with `window.Date`, the same `Date` constructor your code sees in the sandbox.
