**Key insight:** iterate over all of `keyof T` and *remap* the keys you don't want to `never`. Keeping `keyof T` as the source of the mapping is what preserves `readonly` and `?`.

## Approach

```ts
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}
```

The `as` clause (TypeScript 4.1+) runs per key. `P extends K ? never : P` drops the omitted keys, because a key remapped to `never` doesn't appear in the result. The constraint `K extends keyof T` turns a typo like `'author'` into an error.

The tempting version `{ [P in MyExclude<keyof T, K>]: T[P] }` gives the right keys but the wrong modifiers: once the key set is a computed union rather than `keyof T` (or a type parameter constrained to it), the mapped type is no longer homomorphic, so `readonly id` and `draft?` come out as plain required properties. The built-in works around this with `Pick<T, Exclude<keyof T, K>>`: `Pick`'s `K extends keyof T` parameter makes it homomorphic again.

## Step by step

`MyOmit<{ id: number; name: string; password: string }, 'password'>`:

| Key `P` | `P extends 'password'`? | Remapped key |
| --- | --- | --- |
| `id` | no | `id` |
| `name` | no | `name` |
| `password` | yes | `never` (the key is dropped) |

Result: `{ id: number; name: string }`. The `as` clause in a mapped type remaps keys, and mapping a key to `never` removes it. Iterating `keyof T` (not `K`) keeps the original modifiers.

## Pitfalls

- `Pick<T, Exclude<keyof T, K>>` works too but loses nothing; know both.
- The built-in `Omit` accepts any key (`K extends keyof any`), so typos aren't caught; this version constrains `K extends keyof T`.

## Follow-ups

- The built-in `Omit` uses `K extends keyof any`. Why might the library authors have chosen the looser constraint?
- `Omit` over a union (`Omit<A | B, 'x'>`) collapses it into one object. Write a `DistributiveOmit`.

## In the interview

Show the key-remapping form and the `Pick`+`Exclude` form, and mention the constraint difference from the built-in.
