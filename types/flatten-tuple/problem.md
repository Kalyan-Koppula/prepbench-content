---
title: Flatten and FlattenDepth
difficulty: Hard
order: 23
tags: [tuples, recursion, variadic-tuples]
frequency: medium
hints:
  - "Walk the tuple with `[infer H, ...infer R]`: spread `H` if it's a tuple, otherwise keep it as one element."
  - "There's no arithmetic in the type system. Count depth with a tuple you grow by one element per level and compare its `length` to `D`."
---

Implement the type-level `Array.prototype.flat` for tuples. Don't use the built-in `FlatArray`.

- `Flatten<T>` flattens nested tuples completely.
- `FlattenDepth<T, D>` flattens only `D` levels deep (default `1`), like `arr.flat(depth)`.

```ts
type A = Flatten<[1, [2, [3, [4]]]]>         // [1, 2, 3, 4]
type B = FlattenDepth<[1, [2, [3, [4]]]]>    // [1, 2, [3, [4]]]
type C = FlattenDepth<[1, [2, [3, [4]]]], 2> // [1, 2, 3, [4]]
```

- Inputs and nested arrays are fixed-length tuples (possibly `readonly`, as `as const` produces); you don't need to handle open-ended arrays like `number[]`.
- Elements that aren't tuples (including objects that contain tuples) are kept as they are, in order. Empty nested tuples disappear.
- The result is a mutable tuple. `FlattenDepth<T, 0>` returns `T` unchanged, and a depth larger than the nesting just flattens everything.
