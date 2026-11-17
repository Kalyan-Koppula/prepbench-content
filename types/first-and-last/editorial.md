**Key insight:** match the tuple against a pattern and `infer` the element you want. If the pattern doesn't match, the tuple is empty and the answer is `never`.

## Approach

```ts
type First<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never
```

`[infer H, ...unknown[]]` only matches tuples with at least one element. Since TypeScript 4.2 a rest element can come first, so `[...unknown[], infer L]` grabs the last position, including from `[...string[], number]`.

The `readonly` in both the constraint and the pattern matters: a `readonly` tuple doesn't match a mutable tuple pattern.

Common near-misses:

- `T[0]`: for `[]` it's `undefined`, not `never`.
- `T extends [] ? never : T[0]`: misses `readonly []` (which isn't assignable to `[]`), and there's no index-based equivalent for `Last`; `T[T['length'] - 1]` isn't valid TypeScript, because type-level arithmetic doesn't exist.
- Checking `T[0] extends undefined` to detect emptiness: wrong for `[undefined, 1]`.

## Follow-ups

- Write `Pop<T>` and `Shift<T>` that return the tuple *without* its last or first element.
- What should `First<string[]>` be, and what does each version above return for it?
