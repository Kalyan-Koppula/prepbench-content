**Key insight:** `Object.assign` is "for each source, for each own enumerable key, `target[key] = source[key]`". The details interviewers check all follow from that sentence: get/set semantics, symbols, and the null handling.

## Approach

1. `null`/`undefined` target → `TypeError`; otherwise `to = Object(target)`.
2. For each source: skip `null`/`undefined`, box the rest with `Object(source)`.
3. For each key in `Reflect.ownKeys(from)` (strings then symbols), check `Object.getOwnPropertyDescriptor(from, key).enumerable`.
4. Copy with `to[key] = from[key]`: reading runs getters, writing runs setters.
5. Return `to`.

## Walkthrough

`objectAssign({ a: 1 }, null, { b: 2 }, { a: 3, [Symbol('s')]: 4 })`:

| Source | Action | Target after |
| --- | --- | --- |
| `null` | skipped | `{ a: 1 }` |
| `{ b: 2 }` | copy `b` | `{ a: 1, b: 2 }` |
| `{ a: 3, [s]: 4 }` | copy `a` (overwrite) and the symbol key | `{ a: 3, b: 2, [s]: 4 }` |

Only **own enumerable** properties are copied (string and symbol keys), using normal assignment, so setters on the target run. The copy is shallow: nested objects are shared.

## Complexity

`O(total keys)`.

## Edge cases to test

- Later sources overwrite earlier ones.
- `null`/`undefined` sources are skipped; a `null` target throws.
- Symbol keys are copied; inherited and non-enumerable ones aren't.
- The target itself is returned (mutated).
- Getters on sources are invoked; setters on the target are triggered.

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

## In the interview

Contrast with object spread (`{ ...a, ...b }`), which defines properties on a new object instead of assigning, so it doesn't trigger setters.
