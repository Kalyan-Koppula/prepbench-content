**Key insight:** `Object.assign` is "for each source, for each own enumerable key, `target[key] = source[key]`". The details interviewers check all follow from that sentence: get/set semantics, symbols, and the null handling.

## Approach

1. `null`/`undefined` target → `TypeError`; otherwise `to = Object(target)`.
2. For each source: skip `null`/`undefined`, box the rest with `Object(source)`.
3. For each key in `Reflect.ownKeys(from)` (strings then symbols), check `Object.getOwnPropertyDescriptor(from, key).enumerable`.
4. Copy with `to[key] = from[key]`: reading runs getters, writing runs setters.
5. Return `to`.

## Pitfalls

- `for…in`: includes inherited enumerable properties and skips symbols.
- `Object.keys` alone: misses symbol keys.
- Copying descriptors with `Object.defineProperty`: that's a *clone*, not an assign; getters are copied as getters and target setters are bypassed.
- Returning a new object instead of `target`.
- Throwing on `null` sources (only a `null` target throws).

## Follow-ups interviewers add

- **Shallow vs deep:** nested objects are shared; write a `deepMerge` that recurses into plain objects and decide what to do with arrays.
- **Copy descriptors faithfully:** `Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))`.
- **Spread vs assign:** `{ ...a }` defines properties (no setters run) while `Object.assign` sets them.
- **Errors mid-copy:** if a setter throws halfway, properties already copied stay. Why might that matter?
