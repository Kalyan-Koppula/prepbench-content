**Key insight:** a conditional type is the type-level `if`, and since `boolean` is `true | false`, distribution gives `T | F` for free.

## Approach

```ts
type MyIf<C extends boolean, T, F> = C extends true ? T : F
```

The constraint `C extends boolean` rejects `null`, `'true'` and friends. Under `strict`, `null` isn't assignable to `boolean`; without `strictNullChecks` it would be.

Because `C` is a naked type parameter, `MyIf<boolean, 1, 2>` evaluates as `MyIf<true, 1, 2> | MyIf<false, 1, 2>`, which is `1 | 2`. That's the honest answer when the condition isn't known. If you wrote `[C] extends [true]`, `boolean` would fail the check and you'd get only `F`.

## Step by step

| `C` | Result |
| --- | --- |
| `true` | `T` |
| `false` | `F` |
| `boolean` (`true \| false`) | `T \| F`: the conditional distributes over both members |

The third row is the interesting one: because `C` is a bare type parameter, `MyIf<boolean, 'a', 'b'>` is `'a' | 'b'`.

## Pitfalls

- Forgetting the `C extends boolean` constraint, which allows nonsense like `MyIf<'yes', …>`.

## Follow-ups

- What does `MyIf<never, 1, 2>` return, and why? Change the definition so it returns `F` instead.
- Write `And<A, B>`, `Or<A, B>` and `Not<A>` for boolean literal types.

## In the interview

Simple, but a good place to show you know distribution: mention the `boolean` case before the interviewer asks.
