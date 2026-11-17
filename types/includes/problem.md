---
title: Includes
difficulty: Medium
order: 13
tags: [tuples, recursion, equality]
frequency: high
hints:
  - "`U extends T[number]` is an assignability check; it says `true` for `Includes<[number], 1>`. You need exact type equality."
  - "Two types are identical when `<G>() => G extends X ? 1 : 2` and `<G>() => G extends Y ? 1 : 2` are mutually assignable."
  - Walk the tuple one element at a time with `[infer H, ...infer R]`.
---

Implement `Includes<T, U>`, the type-level `Array.prototype.includes`. It's `true` when some element of the tuple `T` is **exactly** the type `U`, and `false` otherwise.

```ts
type A = Includes<['a', 'b'], 'a'>    // true
type B = Includes<[1, 2], number>     // false: number is not exactly 1 or 2
type C = Includes<[boolean], true>    // false: true is not exactly boolean
```

- "Exactly" means identical, not assignable in either direction: `readonly` vs mutable properties differ, `any` and `unknown` differ, a union differs from one of its members.
- The result is always the literal `true` or `false`, never `boolean`.
- `readonly` tuples must work.
- Write your own equality check rather than using the test helper `Equal`.
