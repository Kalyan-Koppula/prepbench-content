**Key insight:** `T[number]` is an indexed access type: "the type you get when you read `T` at any numeric index", which for a tuple is the union of all element types.

## Approach

```ts
type TupleToUnion<T extends readonly unknown[]> = T[number]
```

The constraint matters twice. It's what makes `'abc'` an error. And it has to be `readonly unknown[]`, not `unknown[]`: a `readonly` array is a supertype of a mutable one, so `readonly unknown[]` accepts both, while `unknown[]` rejects every `as const` tuple.

An empty tuple has no elements, so `[][number]` is `never`. Rest elements contribute their element type, so `readonly [string, ...number[]]` gives `string | number`.

A recursive version (`T extends [infer H, ...infer R] ? H | TupleToUnion<R> : never`) also works for fixed tuples, but it misses rest elements and is slower. Reach for `T[number]` first.

## Follow-ups

- Derive a runtime validator `isRole(x: string): x is Role` that uses the same `ROLES` array.
- Why does `typeof ROLES[number]` need the parentheses `(typeof ROLES)[number]` in some positions?
