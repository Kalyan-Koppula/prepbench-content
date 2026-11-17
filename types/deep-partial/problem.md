---
title: DeepPartial
difficulty: Medium
order: 17
tags: [mapped-types, recursion, conditional-types]
frequency: high
hints:
  - Same skeleton as `DeepReadonly`, with a different modifier.
  - "Applying `?` to an array's mapped type gives `(X | undefined)[]`. Give arrays their own branch without the `?`."
---

Implement `DeepPartial<T>` without using `Partial`. It's the type of a deep "patch" object, where every property at every depth is optional. It's what a `mergeConfig(base, patch)` or a nested form's initial values would accept.

```ts
interface Config {
  server: { host: string; port: number }
  features: { name: string; on: boolean }[]
}

const patch: DeepPartial<Config> = { server: { port: 8080 } } // ok
```

- Object properties become optional, recursively.
- Arrays and tuples keep their shape (elements don't become `| undefined`), but each element is made deep-partial.
- Functions and primitives are left unchanged, and union members are handled one by one.
- `readonly` modifiers that were already there are kept.
