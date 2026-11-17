---
title: Object.assign
difficulty: Medium
order: 12
tags: [objects, property descriptors, symbols]
frequency: medium
exports: [objectAssign]
hints:
  - Turn the target into an object first (`null`/`undefined` is a `TypeError`), skip `null`/`undefined` sources, and box the other sources.
  - "`Reflect.ownKeys` gives string *and* symbol keys; keep the ones whose own descriptor is enumerable."
  - Copy by reading (`source[key]`, which runs getters) and assigning (`target[key] = …`, which runs setters).
---

Implement `objectAssign(target, ...sources)`, a standalone version of `Object.assign`: copy every **own enumerable** property (string and symbol keys) from each source onto `target`, left to right, and return `target`.

```js
const defaults = { theme: 'light', size: 'm' }
const user = { size: 'l' }
objectAssign({}, defaults, user)   // { theme: 'light', size: 'l' }

objectAssign({}, null, 'hi')       // { 0: 'h', 1: 'i' }
```

**Don't use** `Object.assign` or object spread.

## Notes

- `target` of `null`/`undefined` → `TypeError`. A primitive target is boxed (`objectAssign(1, …)` returns a `Number` object).
- Sources that are `null`/`undefined` are skipped. Primitive sources are boxed, so a string copies its characters by index; numbers and booleans have nothing to copy.
- Only own, enumerable properties are copied, including enumerable symbol keys. Inherited and non-enumerable properties are not.
- Copying uses get and set: **getters** on a source are invoked and their value is copied as a plain property; **setters** on the target are triggered.
- Later sources overwrite earlier ones. Return the same `target` object, not a copy.
