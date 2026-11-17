---
title: Concat
difficulty: Easy
order: 12
tags: [tuples, variadic-tuples]
frequency: medium
hints:
  - Tuple types support spread, just like array literals.
  - Accept `readonly` tuples as input; the output can be a normal tuple.
---

Implement `Concat<A, B>`, the type-level `Array.prototype.concat` for two tuples:

```ts
type Headers = Concat<['id', 'name'], ['email']> // ['id', 'name', 'email']
```

- Both arguments must be arrays or tuples (`readonly` allowed); anything else is a type error.
- The result is a mutable tuple even when the inputs are `readonly`.
- Rest elements are preserved: concatenating `string[]` and `[0]` gives `[...string[], 0]`.
