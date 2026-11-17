**Key insight:** a memoizer is a closure around a `Map`. Compute the key, check `has`, and only call `fn` on a miss. Exposing the map as `memoized.cache` turns cache control into plain `Map` operations.

## Approach

1. Create the `Map` once and attach it to the returned function as `cache`.
2. On each call, compute `key = resolver ? resolver.apply(this, args) : args[0]`.
3. Read `memoized.cache` at call time (not a captured local) so swapping or clearing it from outside takes effect.
4. On `has(key)`, return `get(key)`. Otherwise call `fn.apply(this, args)`, store the result, return it.
5. Store only after `fn` returns, so a throw leaves no entry behind.

## Pitfalls

- `if (cache.get(key))` treats `0`, `''` and `undefined` results as misses.
- A plain object as the cache stringifies keys: `1` and `'1'` collide and every object becomes `"[object Object]"`.
- `JSON.stringify(args)` as the default key: slow for big inputs, throws on cycles, and treats different objects with the same content as equal.
- Losing `this`: methods memoized with an arrow wrapper break.

## Follow-ups interviewers add

- **Unbounded growth:** add a max size with LRU eviction (a `Map` keeps insertion order, so delete and re-insert on hit).
- **Multi-argument keys without strings:** a trie of nested `Map`s/`WeakMap`s, one level per argument.
- **`WeakMap` for object keys** so cached entries don't keep objects alive.
- **Async memoize:** cache the promise, and evict it on rejection.
- **TTL:** expire entries after N ms.
