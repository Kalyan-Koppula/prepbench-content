**Key insight:** inference in a contravariant position intersects its candidates. Wrap each member as a function *parameter*, then infer that parameter back out.

## Approach

```ts
type UnionToIntersection<U> =
  (U extends unknown ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never
```

1. `U extends unknown ? (arg: U) => void : never` distributes over the union: `A | B` becomes `((arg: A) => void) | ((arg: B) => void)`.
2. That union is matched against `(arg: infer I) => void`. `I` gets one candidate per member, `A` and `B`. Because `I` is a parameter type, a valid `I` must be assignable to *every* candidate: a function that accepts `A & B` can stand in for both functions. So TypeScript infers `A & B`.

The outer conditional must **not** distribute; it doesn't, because its checked type is a wrapped expression, not a naked type parameter.

If you infer from a covariant position instead (e.g. `() => infer I`), the candidates are combined with `|` and you get the union back.

## Step by step

`UnionToIntersection<{ a: 1 } | { b: 2 }>`:

| Step | Result |
| --- | --- |
| Distribute into function types | `((arg: { a: 1 }) => void) \| ((arg: { b: 2 }) => void)` |
| Infer the argument of that union of functions | TypeScript must find a type accepted by **both** functions |
| Parameters are contravariant | the inferred type is `{ a: 1 } & { b: 2 }` |

The trick converts a union into an intersection by moving it into a contravariant (parameter) position.

## Pitfalls

- Unions of primitives produce `never` (`string & number`).
- `boolean` becomes `true & false`, which is `never`.

## Follow-ups

- Use it to get the last member of a union: `LastOf<U> = UnionToIntersection<U extends unknown ? () => U : never> extends () => infer L ? L : never`. Why does that work, and why is union order officially unspecified?
- What does `UnionToIntersection<boolean>` give, and why?

## In the interview

Explain variance briefly: return types are covariant, parameter types contravariant, and inferring from several candidates in a contravariant position yields an intersection.
