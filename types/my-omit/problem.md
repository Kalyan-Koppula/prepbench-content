---
title: MyOmit
difficulty: Medium
order: 3
tags: [mapped-types, key-remapping, keyof]
frequency: high
hints:
  - You need the keys of `T` minus the keys in `K`, but filtering them through a separate helper loses `readonly` and `?`.
  - Key remapping (`[P in keyof T as ...]`) keeps the mapping homomorphic; mapping a key to `never` drops it.
---

Implement `MyOmit<T, K>` without using `Omit`, `Pick` or `Exclude`. It builds a type with every property of `T` except the ones whose keys are in the union `K`.

```ts
interface Article {
  readonly id: string
  title: string
  body: string
  draft?: boolean
}

type ArticleCard = MyOmit<Article, 'body'>
// { readonly id: string; title: string; draft?: boolean }
```

- Modifiers on the remaining properties (`readonly`, `?`) must be kept.
- Unlike the built-in `Omit`, your version is strict: passing a key that `T` doesn't have is a type error.
