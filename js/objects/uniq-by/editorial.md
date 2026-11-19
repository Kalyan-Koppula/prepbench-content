**Key insight:** keep a `Set` of keys already kept. `Set` uses SameValueZero, which gives you `NaN` handling and type-exact matching for free.

## Approach

1. Normalise `by` into a function.
2. Loop once: compute the key, skip the item if the set has it, otherwise add the key and keep the item.

## Walkthrough

`uniqBy([{ id: 1, v: 'a' }, { id: 2, v: 'b' }, { id: 1, v: 'c' }], 'id')`:

| Item | Key | Seen before? | Output |
| --- | --- | --- | --- |
| `{ id: 1, v: 'a' }` | 1 | no | keep |
| `{ id: 2, v: 'b' }` | 2 | no | keep |
| `{ id: 1, v: 'c' }` | 1 | yes | skip |

The **first** occurrence of each key wins, and order is preserved.

## Complexity

`O(n)` time and space with a `Set`.

## Edge cases to test

- Property-name and function keys.
- First occurrence wins.
- `NaN` keys deduplicate (sets use SameValueZero).
- Object keys compare by reference.

## Pitfalls

- Using a plain object as the "seen" map: keys turn into strings, so `1` and `'1'` collide, and every object key becomes `'[object Object]'`.
- `array.filter((x, i) => array.findIndex(y => key(y) === key(x)) === i)` is O(n²), calls `by` many times and misses `NaN` because `NaN !== NaN`.
- Keeping the **last** item instead of the first (what you get from building a `Map` and reading `.values()` without care).

## Follow-ups interviewers add

- **Keep the last occurrence** but still in first-appearance order, or in last-appearance order.
- **Deep keys:** `uniqBy(rows, r => JSON.stringify(r.tags))`. What breaks (key order, `undefined`)?
- **Streaming:** a generator that yields unique items from an infinite iterable.
- **Memory:** what if keys are large objects? (`WeakSet` won't help for primitives; discuss.)

## In the interview

Mention the "last one wins" variant (iterate backwards or use a `Map` and overwrite) and that `[...new Set(array)]` is the identity-key special case.
