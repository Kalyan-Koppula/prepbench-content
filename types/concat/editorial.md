**Key insight:** variadic tuple types let you spread a tuple type inside another tuple type, exactly like spreading arrays in a value.

## Approach

```ts
type Concat<A extends readonly unknown[], B extends readonly unknown[]> = [...A, ...B]
```

The `readonly unknown[]` constraints accept `as const` tuples and reject non-arrays. Spreading a `readonly` tuple into a new tuple literal type produces a mutable tuple, the same way `[...frozen]` gives a fresh array at runtime.

Spreading a non-tuple array produces a rest element, so `Concat<string[], [0]>` is `[...string[], 0]`. TypeScript normalises spreads, so `[...string[], ...number[]]` becomes `(string | number)[]`.

## Follow-ups

- Type a runtime `concat<A extends unknown[], B extends unknown[]>(a: [...A], b: [...B])` so the result is `[...A, ...B]`. Why does `[...A]` in the parameter make TypeScript infer a tuple instead of an array?
- Write `Flatten` for one level of nesting (see the `FlattenTuple` challenge).
