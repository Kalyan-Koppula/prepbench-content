**Key insight:** a conditional type over a naked type parameter is *distributive*. `T extends U ? X : Y` with `T = A | B` is evaluated as `(A extends U ? X : Y) | (B extends U ? X : Y)`.

## Approach

```ts
type MyExclude<T, U> = T extends U ? never : T
type MyExtract<T, U> = T extends U ? T : never
```

Each member of `T` is tested on its own. Members mapped to `never` disappear because `never` is the identity of union (`X | never` is `X`).

Distribution only happens when the checked type is a bare type parameter. Wrapping it (`[T] extends [U]`) tests the union as a whole: `['a' | 'b'] extends ['a']` is false, so `MyExclude<'a' | 'b', 'a'>` would keep both members. Wrapping is the right move when you *don't* want distribution (see `IsNever`, `MyIf`).

For `Shape`, `{ kind: 'circle'; radius: number }` is assignable to `{ kind: 'circle' | 'square' }`, so it's kept whole. That's how you narrow a discriminated union at the type level.

## Follow-ups

- Why is `MyExclude<never, 'a'>` `never`, and why does `IsNever<T> = T extends never ? true : false` return `never` for `never`?
- Write `NonNullable` using only `MyExclude`. Then write it with an intersection: `T & {}`.
