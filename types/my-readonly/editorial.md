**Key insight:** a mapped type over `keyof T` can prefix each key with `readonly`, and because it maps over `keyof T` directly it keeps every other modifier.

## Approach

`{ readonly [K in keyof T]: T[K] }` visits each key and copies its type. A mapped type of the form `[K in keyof T]` with `T` a type parameter is *homomorphic*: TypeScript carries over `?` and existing `readonly` from `T`, and when `T` is an array or tuple it produces an array or tuple instead of an object with numeric keys. That's why `MyReadonly<number[]>` is `readonly number[]`.

Only the top level changes. `T[K]` is copied as-is, so `links` is still `{ site: string }` with a writable `site`.

## Follow-ups

- Write `Mutable<T>` that removes `readonly` (hint: `-readonly`).
- Make it deep: see `DeepReadonly`.
- `Readonly<T>` is a type-level promise only. What does `Object.freeze` add at runtime, and how is its return type declared?
