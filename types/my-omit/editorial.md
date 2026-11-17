**Key insight:** iterate over all of `keyof T` and *remap* the keys you don't want to `never`. Keeping `keyof T` as the source of the mapping is what preserves `readonly` and `?`.

## Approach

```ts
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}
```

The `as` clause (TypeScript 4.1+) runs per key. `P extends K ? never : P` drops the omitted keys, because a key remapped to `never` doesn't appear in the result. The constraint `K extends keyof T` turns a typo like `'author'` into an error.

The tempting version `{ [P in MyExclude<keyof T, K>]: T[P] }` gives the right keys but the wrong modifiers: once the key set is a computed union rather than `keyof T` (or a type parameter constrained to it), the mapped type is no longer homomorphic, so `readonly id` and `draft?` come out as plain required properties. The built-in works around this with `Pick<T, Exclude<keyof T, K>>`: `Pick`'s `K extends keyof T` parameter makes it homomorphic again.

## Follow-ups

- The built-in `Omit` uses `K extends keyof any`. Why might the library authors have chosen the looser constraint?
- `Omit` over a union (`Omit<A | B, 'x'>`) collapses it into one object. Write a `DistributiveOmit`.
