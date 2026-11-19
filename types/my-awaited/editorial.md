**Key insight:** describe "awaitable" structurally (something with a `then` method), `infer` the value its callback receives, and recurse on that value.

## Approach

```ts
type MyAwaited<T> = T extends { then(onfulfilled: (value: infer V) => any): any }
  ? MyAwaited<V>
  : T
```

- `Promise<X>`'s `then` takes an `onfulfilled` callback whose first parameter is `X`, so `V` is inferred as `X`. A hand-written thenable with the same shape matches too, which is exactly how `await` behaves at runtime.
- Recursing on `V` handles `Promise<Promise<...>>`. Anything that doesn't match the pattern is already "settled" and comes back unchanged, including `number`, `null` and `ApiResponse`.
- `T` is a naked type parameter, so the conditional distributes over unions: `Promise<string> | null` is handled as two separate inputs.

Matching only `Promise<infer V>` misses custom thenables, and it fails for `PromiseLike` values from libraries that return their own promise types.

## Step by step

`MyAwaited<Promise<Promise<string>>>`:

| Step | `T` | Matches `{ then(onfulfilled: (value: infer V) => any): any }`? | Next |
| --- | --- | --- | --- |
| 1 | `Promise<Promise<string>>` | yes, `V = Promise<string>` | recurse |
| 2 | `Promise<string>` | yes, `V = string` | recurse |
| 3 | `string` | no | result `string` |

Matching on the `then` method (not on `Promise`) makes it work for any thenable, like the runtime's `await`.

## Pitfalls

- Matching `Promise<infer V>` only, which misses custom thenables.
- Not recursing, which leaves nested promises.

## Follow-ups

- The built-in `Awaited` also checks `null | undefined` first and requires `onfulfilled`'s parameter to be a function. Read its definition in `lib.es5.d.ts` and explain each branch.
- Type `async function all<T extends readonly unknown[]>(values: T)` so it returns `Promise<{ [K in keyof T]: MyAwaited<T[K]> }>`.

## In the interview

Explain `infer` in a method parameter's callback position, and the recursion. Mention that the built-in `Awaited` also handles `null`/`undefined` and non-object types carefully.
