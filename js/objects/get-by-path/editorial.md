**Key insight:** split the problem in two: parse the path into a list of keys, then walk the keys with a null check at every step.

## Approach

1. If `path` is an array, use it directly. Otherwise extract the keys with `path.match(/[^.[\]]+/g)`: every run of characters that isn't `.`, `[` or `]`. That treats `a[0]` and `a.0` the same and copes with a leading `[0]`. `match` returns `null` for `''`, so fall back to `[]`.
2. Walk the keys: if the current value is `null` or `undefined`, return the default; otherwise step into `current[key]`.
3. At the end, return the default only if the value is `undefined`.

## Walkthrough

`get({ a: { b: [{ c: 3 }] } }, 'a.b[0].c')`:

| Step | Key | Current value |
| --- | --- | --- |
| parse | `'a.b[0].c'` → `['a', 'b', '0', 'c']` | – |
| 1 | `a` | `{ b: [...] }` |
| 2 | `b` | `[{ c: 3 }]` |
| 3 | `0` | `{ c: 3 }` |
| 4 | `c` | `3` |

With `'a.x.y'`, step 2 gives `undefined` and step 3 stops early, returning the default value instead of throwing.

## Complexity

`O(k)` for `k` path segments.

## Edge cases to test

- Dot paths, bracket indices and array paths.
- Missing intermediate values return the default.
- A stored `undefined` returns the default; a stored `null` returns `null`.
- Falsy values like `0` and `''` are returned, not replaced by the default.

## Pitfalls

- `value || defaultValue` replaces `0`, `''`, `false` and `null` with the default.
- `typeof current !== 'object'` as the stop condition breaks `'name.length'` and reading through functions; only `null` and `undefined` can't be indexed.
- `path.split('.')` alone leaves `'posts[0]'` as one key.
- `try { ... } catch { return defaultValue }` works but hides real bugs (for example a throwing getter).

## Follow-ups interviewers add

- **Quoted keys:** support `a["b.c"]` and `a['x']`; this is where a small tokenizer beats a regex.
- **Optional chaining:** how would you write `get(state, 'user.posts[0].title')` without the helper? When is the helper still useful (paths that come from config or strings)?
- **Memoise path parsing** for hot paths: cache `path -> keys` in a `Map`.
- **Typed version:** in TypeScript, infer the return type from a literal path string.
- **Write side:** see "Set by Path".

## In the interview

Mention that optional chaining (`a?.b?.[0]?.c ?? fallback`) replaced most uses when paths are known at write time; `get` remains useful for dynamic paths (configs, form libraries).
