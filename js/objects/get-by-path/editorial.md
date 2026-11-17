**Key insight:** split the problem in two: parse the path into a list of keys, then walk the keys with a null check at every step.

## Approach

1. If `path` is an array, use it directly. Otherwise extract the keys with `path.match(/[^.[\]]+/g)`: every run of characters that isn't `.`, `[` or `]`. That treats `a[0]` and `a.0` the same and copes with a leading `[0]`. `match` returns `null` for `''`, so fall back to `[]`.
2. Walk the keys: if the current value is `null` or `undefined`, return the default; otherwise step into `current[key]`.
3. At the end, return the default only if the value is `undefined`.

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
