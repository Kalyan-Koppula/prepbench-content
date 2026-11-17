---
title: MyPick
difficulty: Easy
order: 1
tags: [mapped-types, keyof]
frequency: high
hints:
  - A mapped type iterates over a union of keys with `[P in K]`.
  - Constrain `K` so it can only be keys of `T`.
---

Implement `MyPick<T, K>` without using the built-in `Pick`. It builds a type with only the properties of `T` whose keys are in the union `K`.

```ts
interface Todo {
  title: string
  description: string
  done: boolean
}

type Preview = MyPick<Todo, 'title' | 'done'>
// { title: string; done: boolean }
```

Passing a key that `T` doesn't have must be a type error.
