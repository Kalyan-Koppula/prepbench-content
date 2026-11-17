---
title: MyExclude and MyExtract
difficulty: Easy
order: 5
tags: [conditional-types, distributive, unions]
frequency: high
hints:
  - A conditional type whose checked type is a naked type parameter runs once per member of a union.
  - Returning `never` for a member removes it from the resulting union.
---

Implement two union filters without using the built-in `Exclude` or `Extract`:

- `MyExclude<T, U>` keeps the members of the union `T` that are **not** assignable to `U`.
- `MyExtract<T, U>` keeps the members of `T` that **are** assignable to `U`.

```ts
type Status = 'idle' | 'loading' | 'success' | 'error'

type Settled = MyExclude<Status, 'idle' | 'loading'> // 'success' | 'error'
type Strings = MyExtract<'a' | 1 | 'b' | true, string> // 'a' | 'b'
```

The filter works member by member, so object members are kept or dropped whole depending on whether each one matches.
