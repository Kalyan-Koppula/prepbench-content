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

## Step by step

`DeepPartial<{ server: { host: string; ports: number[] } }>`:

| Path | Result |
| --- | --- |
| `server` | optional, and its contents are partial |
| `server.host` | `host?: string` |
| `server.ports` | `ports?: number[]`: the property becomes optional; the array is mapped element-wise (each element deep-partial) without making indices optional |

Typical use: configuration overrides (`mergeConfig(defaults, overrides: DeepPartial<Config>)`), where a caller sets one nested value.

## Pitfalls

- Making array **indices** optional, which turns tuples into sparse shapes.
- Recursing into functions, dates or maps (treat non-plain objects as leaves when needed).

## Follow-ups

- Type `merge<T>(base: T, patch: DeepPartial<T>): T` and think about what happens when a patch sets a nested object to `undefined`.
- How should `DeepPartial<Map<string, User>>` behave? Add a branch for `Map` and `Set`.

## In the interview

Explain the branches: functions as leaves, arrays mapped element-wise, objects made optional recursively, primitives unchanged.
