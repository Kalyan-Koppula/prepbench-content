**Key insight:** a mapped type over the key union `K`, with `K` constrained to `keyof T`, both builds the object and rejects unknown keys.

## Approach

`[P in K]: T[P]` walks each key in `K` and copies its property type from `T`. The constraint `K extends keyof T` is what produces the error for `'missing'`. Because `[P in K]` with `K extends keyof T` is a *homomorphic* mapped type, modifiers like `readonly` and `?` carry over.

## Follow-ups

- Implement `MyOmit<T, K>` with key remapping: `[P in keyof T as P extends K ? never : P]: T[P]`.
- Why does `Pick<T, K>` keep `readonly` but `Record<K, T[K]>` doesn't?
