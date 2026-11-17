---
title: Objects as property keys
difficulty: Medium
order: 16
tags: [coercion, objects]
frequency: medium
expected: |
  second 1|[object Object]
  true
---

```js
const cache = {}
const a = { id: 1 }
const b = { id: 2 }

cache[a] = 'first'
cache[b] = 'second'
cache[1] = 'one'

console.log(cache[a], Object.keys(cache).join('|'))
console.log(cache['1'] === cache[1])
```

## Explanation

Plain-object keys are always strings (or symbols). Anything else is converted with `String()`.

1. `a` and `b` both stringify to `'[object Object]'`, so `cache[b] = 'second'` overwrites the value stored under `a`. Reading `cache[a]` reads that same key: `second`.
2. `cache[1]` uses the key `'1'`. Object key order puts integer-like keys first in ascending order, then string keys in insertion order: `1|[object Object]`.
3. `cache['1']` and `cache[1]` are the same property: `true`.

Use a `Map` when the keys are objects; it compares keys by identity.

Rule to remember: object keys are strings, so different objects collide on `'[object Object]'`, and `1` and `'1'` are the same key.
