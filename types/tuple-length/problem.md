---
title: Tuple Length
difficulty: Easy
order: 9
tags: [tuples, indexed-access]
frequency: medium
hints:
  - Tuples are arrays, and arrays have a property that knows how long they are.
  - "`as const` gives you a `readonly` tuple, so the constraint must allow `readonly`."
---

Implement `Length<T>`, the length of a tuple type as a number literal.

```ts
const PALETTE = ['red', 'green', 'blue'] as const

type N = Length<typeof PALETTE> // 3
```

- `readonly` tuples must work. Anything that isn't an array or tuple is a type error.
- For a plain array (unknown length) the answer is `number`.
- A tuple with optional elements can have more than one length: `[string, number?]` is `1 | 2`.
