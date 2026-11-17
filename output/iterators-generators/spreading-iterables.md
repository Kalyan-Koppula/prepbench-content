---
title: What spread can iterate
difficulty: Easy
order: 5
tags: [iterables, spread]
frequency: medium
expected: |
  [3,1,2]
  [["a",1],["b",2]]
  ["a","b"]
  3 4
  TypeError
---

```js
const s = new Set([3, 1, 3, 2])
const m = new Map([['a', 1], ['b', 2]])

console.log(JSON.stringify([...s]))
console.log(JSON.stringify([...m]))
console.log(JSON.stringify([...m.keys()]))

const text = 'a😀b'
console.log([...text].length, text.length)

try {
  const arr = [...{ a: 1 }]
} catch (e) {
  console.log(e.name)
}
```

## Explanation

Array spread works with anything that has a `Symbol.iterator` method.

1. A `Set` iterates its unique values in insertion order: `[3,1,2]`.
2. A `Map` iterates `[key, value]` pairs; `m.keys()` iterates just the keys.
3. A string iterates by **code point**. The emoji is one code point but two UTF-16 code units, so spread gives 3 items while `.length` is 4.
4. A plain object has no `Symbol.iterator`, so `[...obj]` throws a `TypeError`. (Object spread `{ ...obj }` is a different feature and works.)

Rule to remember: `[...x]` needs an iterable; `{...x}` copies own enumerable properties. Plain objects only support the second.
