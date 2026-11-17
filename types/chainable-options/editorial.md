**Key insight:** the builder's state lives in a type parameter. Each `option` call returns a `Chainable` over a bigger object, and the `key` parameter becomes `never` when the key is already there.

## Approach

```ts
type Chainable<T = {}> = {
  option<K extends string, V>(
    key: K extends keyof T ? never : K,
    value: V,
  ): Chainable<{ [P in keyof T | K]: P extends keyof T ? T[P] : V }>
  get(): T
}
```

- **Accumulating.** `T` starts as `{}`. Each call infers the literal key `K` and the value type `V`, and returns `Chainable` of a mapped type over `keyof T | K`. Old keys keep their old types and the new key gets `V`. A mapped type produces a single object type, which is why `get()` returns `{ a: …; b: … }` rather than `T & Record<K, V>`.
- **Rejecting duplicates.** The parameter type `K extends keyof T ? never : K` still lets TypeScript infer `K` from the argument (it infers through both branches of the conditional). Then it checks the argument against the *resolved* parameter type. For a new key that's `K` and the call compiles; for an existing key it's `never` and `'retries'` isn't assignable to `never`, so the error points at the duplicate key.
- **Branches.** Every call returns a new type, so `base.option('a', …)` and `base.option('b', …)` don't see each other's keys, just like an immutable builder at runtime.

A common alternative builds with `Omit<T, K> & Record<K, V>` and wraps the result in a `Simplify<X> = { [P in keyof X]: X[P] }` helper. That works too; the important part is flattening before `get()`.

## Follow-ups

- Allow overriding a key only when the new value type differs, or only via a separate `override(key, value)` method.
- Make `get()` available only after a required key (say `'url'`) has been set.
- How would you implement this builder at runtime so its JS matches these types?
