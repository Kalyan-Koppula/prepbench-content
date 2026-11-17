---
title: MyParameters and MyReturnType
difficulty: Medium
order: 15
tags: [infer, functions, conditional-types]
frequency: high
hints:
  - Match `F` against a function type pattern and put `infer` where the parameters or the return type sit.
  - "The constraint has to accept every function. Think about why `(...args: unknown[]) => unknown` rejects `(id: string) => void` under `strict`."
---

Implement two function helpers without using the built-in `Parameters` or `ReturnType`:

- `MyParameters<F>` is the tuple of `F`'s parameter types.
- `MyReturnType<F>` is the type `F` returns.

```ts
declare function createUser(name: string, age?: number): { id: string }

type P = MyParameters<typeof createUser> // [name: string, age?: number]
type R = MyReturnType<typeof createUser> // { id: string }
```

- Both accept any function type. Passing a non-function is a type error, and so is a class constructor (it can only be called with `new`).
- Optional and rest parameters are kept as they are.
- For an overloaded function, TypeScript only considers the **last** overload signature.
