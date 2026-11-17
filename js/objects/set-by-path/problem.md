---
title: Set by Path
difficulty: Medium
order: 5
tags: [objects, arrays, security]
frequency: medium
exports: [set]
hints:
  - Parse the path into keys exactly like `get`, then walk all keys except the last one.
  - When the next container is missing (or is a primitive), create it, and look at the **following** key to decide between `[]` and `{}`.
  - Check every key against the dangerous names before you write anything.
---

Implement `set(obj, path, value)`, which writes `value` at a nested path, creating whatever containers are missing, and returns `obj`.

```js
const form = {}
set(form, 'address.lines[0]', '1 Main St')
// form is { address: { lines: ['1 Main St'] } }
set(form, ['meta', 'v.2'], true)
// form.meta is { 'v.2': true }
```

## Notes

- Path syntax is the same as `get`: a string with `.` and `[n]` (`'a.b[0].c'`, `'a.0.c'`), or an array of keys used as is.
- `set` mutates `obj` and returns the same object.
- When a container on the way is **missing**, or is a primitive or `null`, replace it with a new one: an **array** if the next key is a non-negative integer (only digits, like `'0'` or `12`), otherwise a plain object.
- Existing objects and arrays on the way are kept as they are, including their other keys. A numeric key on an existing plain object stays an object key.
- **Safety:** if any key is `__proto__`, `constructor` or `prototype`, do nothing and return `obj`. A form field path must never be able to modify `Object.prototype`.
- An empty path does nothing.
