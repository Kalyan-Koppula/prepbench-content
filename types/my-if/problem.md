---
title: MyIf
difficulty: Easy
order: 11
tags: [conditional-types, distributive]
frequency: medium
hints:
  - Constrain the condition to `boolean` so only `true`/`false` (or `boolean`) are accepted.
  - "`boolean` is the union `true | false`. What does a distributive conditional do with it?"
---

Implement `MyIf<C, T, F>`: when the condition `C` is `true` the result is `T`; when it's `false` the result is `F`.

```ts
type A = MyIf<true, 'on', 'off'>  // 'on'
type B = MyIf<false, 'on', 'off'> // 'off'
```

- `C` must be a boolean; anything else (including `null` and `'true'`) is a type error.
- If `C` is the wide type `boolean` (it could be either), the result is `T | F`.
