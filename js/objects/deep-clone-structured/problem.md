---
title: Deep Clone with Cycles and Built-ins
difficulty: Hard
order: 2
tags: [recursion, weakmap, prototypes, map, set]
frequency: medium
exports: [cloneDeep]
hints:
  - Remember every object you have already cloned in a `WeakMap` from original to copy, and register the copy before recursing into its children.
  - Branch on the kind of object (Date, RegExp, Map, Set, array, everything else) and build the right empty container for each.
  - "`Reflect.ownKeys` returns string and symbol keys; `Object.getPrototypeOf` tells you what to pass to `Object.create`."
---

Implement `cloneDeep(value)`, a deep clone that survives real-world object graphs, not just JSON.

```js
class Node {
  constructor(name) { this.name = name; this.links = new Set() }
}
const a = new Node('a')
a.links.add(a)                // a cycle
const copy = cloneDeep(a)
copy instanceof Node          // true
copy.links.has(copy)          // true: the cycle points at the copy
copy.links.has(a)             // false
```

## Notes

- **Cycles and shared references:** if the same object appears twice in the input, the same clone appears twice in the output. Cycles must not overflow the stack.
- **Prototypes:** a cloned object has the same prototype as the original (class instances stay instances, `Object.create(null)` objects stay null-prototype). Copy own **enumerable** properties, both string and **symbol** keys.
- **Arrays** become arrays.
- **`Date`** becomes a new `Date` with the same time. **`RegExp`** becomes a new `RegExp` with the same `source` and `flags`.
- **`Map`** and **`Set`** become new collections whose keys, values and members are all cloned deeply (the same rule `structuredClone` uses).
- Primitives and functions are returned as they are.
- The tests build dates with `window.Date`, the same `Date` constructor your code sees in the sandbox.
