**Key insight:** write the general shape of a function type and put `infer` in the slot you want to extract.

## Approach

```ts
type MyParameters<F extends (...args: any) => any> = F extends (...args: infer P) => any ? P : never
type MyReturnType<F extends (...args: any) => any> = F extends (...args: any) => infer R ? R : never
```

`(...args: infer P)` captures the whole parameter list as a tuple, including labels, optional parameters and rest parameters. `infer R` in the return position captures what the function returns.

**Why `any` in the constraint?** Under `strictFunctionTypes`, parameters are checked contravariantly. `(id: string) => void` is *not* assignable to `(...args: unknown[]) => unknown`, because the target could be called with a number. `(...args: any) => any` (or `(...args: never) => unknown`) accepts every function. This is one of the few places where `any` is the right tool.

**Overloads.** When an overloaded function is matched against a single-signature pattern, TypeScript uses the last overload. Put the most general overload last if you want helpers like these to see it.

## Step by step

```ts
function createUser(name: string, age?: number): { id: string } { … }
type P = MyParameters<typeof createUser>   // [name: string, age?: number]
type R = MyReturnType<typeof createUser>   // { id: string }
```

| Utility | Pattern | `infer` captures |
| --- | --- | --- |
| `MyParameters` | `(...args: infer P) => any` | the parameter tuple, with names and optionality |
| `MyReturnType` | `(...args: any) => infer R` | the return type |

Both use `typeof` on a value to get its type first; they operate on types, not on functions.

## Pitfalls

- Passing the function itself (`MyReturnType<createUser>`) instead of `typeof createUser`.
- Overloaded functions: `infer` uses the **last** overload signature.

## Follow-ups

- Write `FirstParameter<F>` and `AppendArgument<F, A>`, which adds a parameter to the end of `F`.
- Write `MyConstructorParameters<C>` for `abstract new (...args: any) => any`.
- Why does `MyReturnType` of a generic function like `<T>(x: T) => T` give `unknown`?

## In the interview

Mention practical uses: typing wrappers (`(...args: Parameters<F>) => ReturnType<F>`), and the overload caveat.
