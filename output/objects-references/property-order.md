---
title: Property order with integer-like keys
difficulty: Hard
order: 10
tags: [objects, property-order]
frequency: medium
expected: |
  0,1,2,b,a,-1,1.5,c
  b,2,1
---

```js
const obj = { b: 1, 2: 'two', a: 2, 1: 'one', '-1': 'neg', 1.5: 'x' }
obj.c = 3
obj[0] = 'zero'

console.log(Object.keys(obj).join(','))

const m = new Map([['b', 1], [2, 'two'], [1, 'one']])
console.log([...m.keys()].join(','))
```

## Explanation

Own string keys come out in two groups:

1. **Array-index keys** (canonical non-negative integers like `'0'`, `'1'`, `'2'`) first, in **ascending numeric** order, no matter when they were added: `0,1,2`.
2. All other string keys in **insertion order**: `b`, `a`, `-1`, `1.5`, `c`. `'-1'` and `'1.5'` look numeric but aren't array indices, so they're ordinary strings and keep their insertion position.

(Symbol keys would come after both groups.)

A `Map` doesn't reorder anything: keys come back in insertion order, and `2` and `1` stay numbers: `b,2,1`.

Rule to remember: objects put integer keys first in ascending order, then other strings by insertion. If order matters, use a `Map`.
