---
title: MyPartial and MyRequired
difficulty: Easy
order: 4
tags: [mapped-types, modifiers]
frequency: high
hints:
  - Both are mapped types over `keyof T`; only the `?` modifier changes.
  - "`+?` adds the optional modifier and `-?` removes it."
---

Implement two utilities without using the built-in `Partial` or `Required`:

- `MyPartial<T>` makes every top-level property optional.
- `MyRequired<T>` makes every top-level property required.

```ts
interface Draft {
  title?: string
  body: string
}

type A = MyPartial<Draft>  // { title?: string; body?: string }
type B = MyRequired<Draft> // { title: string; body: string }
```

Keep `readonly` where it was. `MyRequired` removes the `undefined` that came from a property being optional, but a required property whose type explicitly includes `undefined` (like `deletedAt: Date | undefined`) keeps it.
