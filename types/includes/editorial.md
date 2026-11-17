**Key insight:** `extends` answers "is X assignable to Y?", which is too loose here. Exact identity needs a check TypeScript can't satisfy by widening: compare two deferred generic conditional types.

## Approach

```ts
type IsSame<X, Y> =
  (<G>() => G extends X ? 1 : 2) extends (<G>() => G extends Y ? 1 : 2) ? true : false

type Includes<T extends readonly unknown[], U> = T extends readonly [infer H, ...infer R]
  ? IsSame<H, U> extends true ? true : Includes<R, U>
  : false
```

**The equality trick.** `<G>() => G extends X ? 1 : 2` is a generic function whose return type is a conditional type TypeScript can't resolve (it depends on `G`). When it compares two such function types, it falls back to checking that the two conditional types are *identical*: same check type, same `extends` type, same branches. That identity check is strict: `any` isn't identical to `unknown`, `{ readonly id: 1 }` isn't identical to `{ id: 1 }`, and `boolean` isn't identical to `true`.

**The walk.** Peel off the first element with `[infer H, ...infer R]`, compare it, and either stop with `true` or recurse on the rest. An empty tuple doesn't match the pattern, so the recursion ends in `false`.

Why simpler versions fail:

- `U extends T[number] ? true : false` is assignability, so `Includes<[number], 1>` says `true`. It also distributes when `U` is a union and returns `boolean`.
- `{ [K in T[number]]: true }[U]` only works for key-like types and still widens.
- Comparing with `[H] extends [U] ? [U] extends [H] ? ...` (mutual assignability) treats `any` as equal to everything, and `{ readonly id: 1 }` as equal to `{ id: 1 }`, since `readonly` doesn't affect assignability.

## Follow-ups

- The equality trick has known edge cases with intersections: `{ a: 1 } & { b: 2 }` vs `{ a: 1; b: 2 }` compare as different. When does that matter?
- Write `IndexOf<T, U>` that returns the position (or `-1`) using the same walk plus an accumulator tuple.
