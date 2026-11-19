**Key insight:** a mapped type over `keyof T` can prefix each key with `readonly`, and because it maps over `keyof T` directly it keeps every other modifier.

## Approach

`{ readonly [K in keyof T]: T[K] }` visits each key and copies its type. A mapped type of the form `[K in keyof T]` with `T` a type parameter is *homomorphic*: TypeScript carries over `?` and existing `readonly` from `T`, and when `T` is an array or tuple it produces an array or tuple instead of an object with numeric keys. That's why `MyReadonly<number[]>` is `readonly number[]`.

Only the top level changes. `T[K]` is copied as-is, so `links` is still `{ site: string }` with a writable `site`.

## Step by step

`MyReadonly<{ title: string; tags: string[] }>`:

| Property | Mapped as | Result |
| --- | --- | --- |
| `title` | `readonly title: T['title']` | `readonly title: string` |
| `tags` | `readonly tags: T['tags']` | `readonly tags: string[]` |

Assigning `todo.title = 'x'` is now an error, but `todo.tags.push('y')` still compiles: `readonly` is **shallow**. [DeepReadonly](/frontend/types/deep-readonly) recurses to fix that.

## Pitfalls

- Expecting `readonly` to freeze nested objects or arrays.
- Confusing it with `Object.freeze`, which is a runtime operation (also shallow).

## Follow-ups

- Write `Mutable<T>` that removes `readonly` (hint: `-readonly`).
- Make it deep: see `DeepReadonly`.
- `Readonly<T>` is a type-level promise only. What does `Object.freeze` add at runtime, and how is its return type declared?

## In the interview

Mention the `-readonly` modifier for the reverse (`Mutable<T>`) and that `readonly` affects only the type checker; nothing changes at runtime.
