---
title: OptionalKeys and RequiredKeys
difficulty: Hard
order: 22
tags: [mapped-types, modifiers, keyof]
frequency: medium
hints:
  - "A property is optional if `{}` is assignable to an object that contains only that property."
  - Build an object mapping each key to itself or `never`, then index it with `keyof T`. Watch out for `undefined` leaking into the result.
---

Implement two key filters. No built-in does this; you may use `Pick` and the other utility types.

- `OptionalKeys<T>` is the union of keys of `T` declared with `?`.
- `RequiredKeys<T>` is the union of the other keys.

```ts
interface Props {
  id: string
  label?: string
  onClose: (() => void) | undefined
}

type O = OptionalKeys<Props> // 'label'
type R = RequiredKeys<Props> // 'id' | 'onClose'
```

What matters is the `?` modifier, not whether the type includes `undefined`: `onClose` above is required (it must be passed, even if the value is `undefined`).
