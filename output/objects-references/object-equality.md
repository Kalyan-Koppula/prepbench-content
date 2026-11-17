---
title: Comparing objects
difficulty: Easy
order: 7
tags: [references, equality]
frequency: high
expected: |
  false false true
  false
  true
  3
  undefined
---

```js
const a = { x: 1 }
const b = { x: 1 }
const c = a

console.log(a === b, a == b, a === c)
console.log([1, 2] === [1, 2])
console.log(JSON.stringify(a) === JSON.stringify(b))

const set = new Set([a, b, c, { x: 1 }])
console.log(set.size)

const cache = new Map()
cache.set({ id: 1 }, 'hit')
console.log(cache.get({ id: 1 }))
```

## Explanation

1. Objects compare by **identity**, not contents. `a` and `b` are two different objects, so both `===` and `==` are `false` (`==` only coerces when one side is a primitive). `c` is the same object as `a`.
2. Two array literals are two different arrays: `false`.
3. Comparing the JSON strings compares contents (it works here, but it depends on key order and drops some values).
4. A `Set` deduplicates by identity: `a` and `c` are the same object, while `b` and the literal are distinct, so there are 3 entries.
5. `Map` keys also match by identity. The `{ id: 1 }` passed to `get` is a new object, so the lookup misses.

Rule to remember: `===`, `Set` and `Map` all compare objects by reference. Keep the same reference if you need to find it again.
