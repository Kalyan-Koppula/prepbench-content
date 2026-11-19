**Key insight:** `T[number]` is an indexed access type: "the type you get when you read `T` at any numeric index", which for a tuple is the union of all element types.

## Approach

```ts
type TupleToUnion<T extends readonly unknown[]> = T[number]
```

The constraint matters twice. It's what makes `'abc'` an error. And it has to be `readonly unknown[]`, not `unknown[]`: a `readonly` array is a supertype of a mutable one, so `readonly unknown[]` accepts both, while `unknown[]` rejects every `as const` tuple.

An empty tuple has no elements, so `[][number]` is `never`. Rest elements contribute their element type, so `readonly [string, ...number[]]` gives `string | number`.

A recursive version (`T extends [infer H, ...infer R] ? H | TupleToUnion<R> : never`) also works for fixed tuples, but it misses rest elements and is slower. Reach for `T[number]` first.

## Step by step

`TupleToUnion<['a', 'b', 'c']>`:

`T[number]` asks "what type do I get when indexing with any number?", which for a tuple is the union of all element types: `'a' | 'b' | 'c'`.

A common real use:

```ts
const ROLES = ['admin', 'editor', 'viewer'] as const
type Role = (typeof ROLES)[number] // 'admin' | 'editor' | 'viewer'
```

One array serves both as runtime data (for a select menu) and as the source of the type.

## Pitfalls

- Forgetting `as const`, which widens the array to `string[]` and the union to `string`.

## Follow-ups

- Derive a runtime validator `isRole(x: string): x is Role` that uses the same `ROLES` array.
- Why does `typeof ROLES[number]` need the parentheses `(typeof ROLES)[number]` in some positions?

## In the interview

Show the `as const` + `[number]` idiom; it's the most practically useful thing in this exercise.
