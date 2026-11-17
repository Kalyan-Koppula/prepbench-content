---
title: Object.keys vs for...in
difficulty: Medium
order: 9
tags: [objects, prototypes, enumeration]
frequency: medium
expected: |
  own,inherited
  own
  true false
  3 {"own":2}
---

```js
const base = { inherited: 1 }
const child = Object.create(base)
child.own = 2
Object.defineProperty(child, 'hidden', { value: 3, enumerable: false })

const forIn = []
for (const k in child) forIn.push(k)
console.log(forIn.join(','))

console.log(Object.keys(child).join(','))
console.log('inherited' in child, Object.hasOwn(child, 'inherited'))
console.log(child.hidden, JSON.stringify(child))
```

## Explanation

1. `for...in` visits **enumerable** string keys, both own and **inherited**, own ones first: `own,inherited`. `hidden` is non-enumerable, so it's skipped.
2. `Object.keys` returns only **own** enumerable keys: `own`.
3. `in` checks the whole prototype chain (`true`); `Object.hasOwn` checks only the object itself (`false`).
4. Non-enumerable properties are still readable (`3`), but `JSON.stringify` serialises only own enumerable properties: `{"own":2}`.

Rule to remember: `for...in` walks the prototype chain; `Object.keys`, `Object.entries`, spread and `JSON.stringify` see only own enumerable properties.
