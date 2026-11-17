---
title: DeepReadonly
difficulty: Medium
order: 16
tags: [mapped-types, recursion, conditional-types]
frequency: high
hints:
  - Recurse into each property, but decide first what kind of type you're looking at (function, object, primitive).
  - A function type is also an `object`; check for it before the object case.
  - A homomorphic mapped type applied to an array gives back an array, so arrays and tuples don't need their own branch.
---

Implement `DeepReadonly<T>` without using `Readonly` or `ReadonlyArray`. It makes every property at every depth `readonly`:

```ts
interface Store {
  user: { name: string; roles: string[] }
}

declare const store: DeepReadonly<Store>
store.user.name = 'x'      // error
store.user.roles.push('a') // error: roles is a readonly string[]
```

- Objects are made readonly recursively; optional properties stay optional.
- Arrays and tuples become `readonly` arrays and tuples, and their elements are made deeply readonly too.
- Functions are left exactly as they are.
- Primitives, and unions of them, are unchanged. A property whose type is a union of an object and a primitive gets the object member made readonly.
