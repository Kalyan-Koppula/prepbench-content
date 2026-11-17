---
title: Chainable Options
difficulty: Hard
order: 25
tags: [generics, builder-pattern, conditional-types]
frequency: medium
hints:
  - "Give `Chainable` a type parameter for the object built so far; each `option` call returns a `Chainable` with a bigger object."
  - To reject a duplicate key, make the `key` parameter's type `never` when `K` is already in the object. TypeScript can still infer `K` through that conditional.
  - "`get()` must return a single object type, not an intersection; build the next object with a mapped type."
---

Type a fluent config builder. A `Chainable` value has two methods:

- `option(key, value)` adds a property and returns a new `Chainable` that knows about it.
- `get()` returns the type of the object built so far.

```ts
declare const config: Chainable

const result = config
  .option('retries', 3 as number)
  .option('mode', 'strict' as const)
  .option('server', { host: 'localhost' })
  .get()
// { retries: number; mode: 'strict'; server: { host: string } }
```

Requirements:

- `Chainable` with no type argument starts with an empty object: `config.get()` is `{}`.
- Keys are strings. Each value's type is whatever TypeScript infers for the argument.
- Adding a key that's already there is a type error at that `option` call.
- `get()` returns one plain object type (`{ a: …; b: … }`), not an intersection like `{ a: … } & { b: … }`.
