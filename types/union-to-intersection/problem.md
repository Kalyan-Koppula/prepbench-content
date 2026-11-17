---
title: UnionToIntersection
difficulty: Hard
order: 21
tags: [conditional-types, infer, variance]
frequency: medium
hints:
  - When TypeScript infers a single type variable from several candidates in a *contravariant* position (a function parameter), it combines them with `&`, not `|`.
  - "First turn each union member into a function that takes it as a parameter (a distributive conditional), then `infer` the parameter type from the union of functions."
---

Implement `UnionToIntersection<U>`, which turns `A | B | C` into `A & B & C`. No built-in does this. It's the building block behind typed `mergeAll` helpers and overload sets.

```ts
type Merged = UnionToIntersection<{ id: string } | { name: string }>
// { id: string } & { name: string }

type Overloads = UnionToIntersection<((x: string) => 'str') | ((x: number) => 'num')>
// ((x: string) => 'str') & ((x: number) => 'num')
```

- A type that isn't a union comes back unchanged.
- Primitives intersect the usual way: `'a' & 'b'` is `never`.
