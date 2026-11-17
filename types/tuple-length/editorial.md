**Key insight:** a tuple type's `length` property is a number literal, so the answer is the indexed access `T['length']`.

## Approach

```ts
type Length<T extends readonly unknown[]> = T['length']
```

TypeScript models a tuple like `['a', 'b']` as an array type whose `length` is the literal `2`. With an optional element the length is a union (`[string, number?]` has `length: 1 | 2`), and a plain array's `length` is just `number`.

The constraint is what turns `'hello'` and `{ length: 2 }` into errors. Without it, `T['length']` would happily return `number` and `2`. `readonly unknown[]` accepts both mutable and `readonly` tuples.

## Follow-ups

- Tuple length is how type-level counting works: build a tuple of `N` elements and read its `length`. Use it to write `Add<A, B>` for small non-negative numbers.
- Write `IsTuple<T>` that's `true` for `[1, 2]` and `false` for `number[]`. (Hint: `number extends T['length']`.)
