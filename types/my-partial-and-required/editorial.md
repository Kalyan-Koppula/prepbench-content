**Key insight:** both utilities are the same homomorphic mapped type; one adds the `?` modifier and the other removes it with `-?`.

## Approach

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyRequired<T> = { [K in keyof T]-?: T[K] }
```

Because they map over `keyof T`, `readonly` is copied from the source. `?` is shorthand for `+?`.

`-?` does slightly more than flip the flag: for a property that *was* optional it also removes the `undefined` that optionality added, so `theme?: 'light' | 'dark'` becomes `theme: 'light' | 'dark'`. For a property that was already required, `T[K]` is copied untouched, so `lastSeen: number | undefined` keeps its `undefined`. A hand-rolled `Exclude<T[K], undefined>` gets that second case wrong.

## Follow-ups

- Write `PartialBy<T, K>` that makes only the keys in `K` optional.
- How does `exactOptionalPropertyTypes` change what `title?: string` accepts?
