---
title: TupleToObject
difficulty: Easy
order: 7
tags: [tuples, mapped-types]
frequency: medium
hints:
  - The union of a tuple's elements is `T[number]`; map over that, not over `keyof T`.
  - Elements must be usable as object keys, so constrain them to `PropertyKey`.
---

Implement `TupleToObject<T>`. Given a tuple of strings, numbers or symbols, it builds an object type where each element is both the key and the value:

```ts
const EVENTS = ['click', 'focus'] as const

type EventMap = TupleToObject<typeof EVENTS>
// { click: 'click'; focus: 'focus' }
```

- It must accept `readonly` tuples (what `as const` produces).
- A tuple containing something that can't be an object key (an object, an array, `boolean`) is a type error.
