**Key insight:** a mapped type over the key union `K`, with `K` constrained to `keyof T`, both builds the object and rejects unknown keys.

## Approach

`[P in K]: T[P]` walks each key in `K` and copies its property type from `T`. The constraint `K extends keyof T` is what produces the error for `'missing'`. Because `[P in K]` with `K extends keyof T` is a *homomorphic* mapped type, modifiers like `readonly` and `?` carry over.

## Step by step

`MyPick<{ id: number; name: string; email: string }, 'id' | 'name'>`:

| Step | Result |
| --- | --- |
| `K` is checked against `keyof T` | `'id' \| 'name'` is allowed; `'age'` would be a compile error at the use site |
| Mapped type iterates `P in K` | `P = 'id'`, then `P = 'name'` |
| Each property takes `T[P]` | `id: number`, `name: string` |

Result: `{ id: number; name: string }`. Because the mapped type iterates over `K` directly (not `keyof T`), modifiers like `readonly` and `?` aren't copied from `T`; the built-in `Pick` uses the same form and TypeScript preserves modifiers for it because `K` is constrained to `keyof T` (a "homomorphic" mapping).

## Pitfalls

- Forgetting `K extends keyof T`, which allows picking keys that don't exist.
- Iterating `keyof T` and filtering, which is `Omit`'s job.

## Follow-ups

- Implement `MyOmit<T, K>` with key remapping: `[P in keyof T as P extends K ? never : P]: T[P]`.
- Why does `Pick<T, K>` keep `readonly` but `Record<K, T[K]>` doesn't?

## In the interview

Say the two ingredients aloud: a constraint that keeps keys valid, and a mapped type with indexed access. Most utility types are variations of this shape.
