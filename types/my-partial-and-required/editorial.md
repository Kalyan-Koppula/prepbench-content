**Key insight:** both utilities are the same homomorphic mapped type; one adds the `?` modifier and the other removes it with `-?`.

## Approach

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyRequired<T> = { [K in keyof T]-?: T[K] }
```

Because they map over `keyof T`, `readonly` is copied from the source. `?` is shorthand for `+?`.

`-?` does slightly more than flip the flag: for a property that *was* optional it also removes the `undefined` that optionality added, so `theme?: 'light' | 'dark'` becomes `theme: 'light' | 'dark'`. For a property that was already required, `T[K]` is copied untouched, so `lastSeen: number | undefined` keeps its `undefined`. A hand-rolled `Exclude<T[K], undefined>` gets that second case wrong.

## Step by step

```ts
type User = { id: number; name?: string }
type A = MyPartial<User>  // { id?: number; name?: string }
type B = MyRequired<User> // { id: number; name: string }
```

| Mapping | Modifier | Effect on each property |
| --- | --- | --- |
| `MyPartial` | `?` | adds optionality |
| `MyRequired` | `-?` | removes optionality (and the `undefined` that came with it under default settings) |

The `-` prefix removes a modifier; `+` (the default) adds it. The same applies to `readonly`.

## Pitfalls

- Writing `[K in keyof T]: T[K] | undefined` for `Partial`: the keys are still required.
- Forgetting that `-?` also strips `undefined` from the property type unless `exactOptionalPropertyTypes` is on.

## Follow-ups

- Write `PartialBy<T, K>` that makes only the keys in `K` optional.
- How does `exactOptionalPropertyTypes` change what `title?: string` accepts?

## In the interview

Show both in two lines and explain modifier addition and removal; interviewers often follow up with `Mutable<T>` (`-readonly`).
