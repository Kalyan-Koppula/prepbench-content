---
title: TupleToUnion
difficulty: Easy
order: 6
tags: [tuples, indexed-access]
frequency: high
hints:
  - Indexing an array type with `number` gives the type of its elements.
  - "`as const` arrays are `readonly` tuples; make sure your constraint accepts them."
---

Implement `TupleToUnion<T>`, which turns an array or tuple type into the union of its element types. This is how you derive a string-literal union from a constant list:

```ts
const ROLES = ['admin', 'editor', 'viewer'] as const

type Role = TupleToUnion<typeof ROLES> // 'admin' | 'editor' | 'viewer'
```

- It must accept both mutable and `readonly` arrays and tuples.
- Anything that isn't an array is a type error.
- Don't hard-code element positions; it has to work for any length.
