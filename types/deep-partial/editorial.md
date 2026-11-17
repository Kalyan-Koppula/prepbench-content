**Key insight:** recursion plus the `?` modifier, with a separate branch for arrays so `?` never touches array elements.

## Approach

```ts
type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly unknown[]
    ? { [K in keyof T]: DeepPartial<T[K]> }
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T
```

- **Functions** pass through; otherwise they'd be mapped to `{}`.
- **Arrays and tuples** get a homomorphic mapped type *without* `?`. TypeScript keeps the array or tuple shape (and its `readonly`-ness) and maps each element. With `?`, the result would be `(X | undefined)[]` for arrays and `[X?, Y?]` for tuples, which is what the built-in `Partial<string[]>` does.
- **Objects** get `?` on every key, and `readonly` comes along because the mapping is homomorphic.
- **Unions** distribute, so `{ url: string } | null` becomes `{ url?: string } | null`.

## Follow-ups

- Type `merge<T>(base: T, patch: DeepPartial<T>): T` and think about what happens when a patch sets a nested object to `undefined`.
- How should `DeepPartial<Map<string, User>>` behave? Add a branch for `Map` and `Set`.
