---
title: First and Last
difficulty: Easy
order: 8
tags: [tuples, infer, conditional-types]
frequency: high
hints:
  - "`T[0]` on an empty tuple isn't `never`, so you need to check the tuple's shape first."
  - Variadic tuple patterns like `[infer H, ...infer _]` and `[...infer _, infer L]` match from either end.
---

Implement two tuple helpers:

- `First<T>` is the type of the first element of `T`.
- `Last<T>` is the type of the last element of `T`.

```ts
type A = First<['x', 'y', 'z']> // 'x'
type B = Last<['x', 'y', 'z']>  // 'z'
type C = First<[]>              // never
```

- An empty tuple gives `never`.
- An element whose type is `undefined` is a real element; don't confuse it with "missing".
- Both accept `readonly` tuples; a non-array argument is a type error.
- `Last` also has to handle a tuple that starts with a rest element, like `[...string[], number]`.
