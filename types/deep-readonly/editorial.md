**Key insight:** decide what kind of type you're looking at, then recurse: functions pass through, objects (including arrays and tuples) get a readonly mapped type over their recursively-transformed properties, and everything else is a primitive.

## Approach

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T
```

- **Functions first.** A function type is an `object`, and mapping over it gives `{}`, because function types have no own properties for `keyof`. Checking for functions first keeps `onChange` intact.
- **Arrays for free.** `{ readonly [K in keyof T]: ... }` is homomorphic. When `T` is instantiated with `number[][]` or `[string, {...}]`, TypeScript maps the *elements* and keeps the array or tuple shape, producing `readonly (readonly number[])[]` and `readonly [string, { readonly done: boolean }]`.
- **Unions distribute.** `T` is a naked type parameter, so `{ id: string } | null` becomes `{ readonly id: string } | null`.

A common near-miss is `keyof T extends never ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> }`. It treats functions correctly (no keys), but a union like `{ id: string } | null` is looked at as a whole instead of member by member, so `selected` comes out wrong.

## Step by step

`DeepReadonly<{ user: { tags: string[] }; save: () => void }>`:

| Property | Type | Branch | Result |
| --- | --- | --- | --- |
| `user` | object | recurse | `readonly user: { readonly tags: readonly string[] }` |
| `tags` | array | object branch: arrays are objects | `readonly string[]` (mapped arrays stay arrays) |
| `save` | function | kept as is | `readonly save: () => void` |

Functions are excluded from recursion because mapping over a function type would lose its call signature.

## Pitfalls

- Recursing into functions.
- Stopping at one level.
- Forgetting that primitives must be returned unchanged.

## Follow-ups

- What happens to `Date`, `Map` or a class instance? Add an escape hatch (e.g. a `Builtin` union that passes through unchanged).
- Write `DeepMutable<T>` with `-readonly`.

## In the interview

Mention that mapped types over arrays and tuples produce arrays and tuples (homomorphic mapping), which is why one object branch handles them.
