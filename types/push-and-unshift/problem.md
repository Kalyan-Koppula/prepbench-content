---
title: Push and Unshift
difficulty: Easy
order: 14
tags: [tuples, variadic-tuples]
frequency: medium
hints:
  - Build a new tuple type that spreads `T` and adds `U` at one end.
  - Spread only `T`; `U` is a single element even when it is itself a tuple.
---

Implement the type-level versions of `Array.prototype.push` and `unshift`:

- `Push<T, U>` is `T` with `U` added at the end.
- `Unshift<T, U>` is `T` with `U` added at the start.

```ts
type A = Push<['a', 'b'], 'c'>    // ['a', 'b', 'c']
type B = Unshift<['a', 'b'], 'z'> // ['z', 'a', 'b']
```

- `T` must be an array or tuple (`readonly` allowed); the result is a mutable tuple.
- `U` is added as **one** element: pushing `[1, 2]` adds a nested tuple, it doesn't concatenate.
