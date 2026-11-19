**Key insight:** `apply` is `call` plus argument normalization. Turn whatever you're given into a real array first (or throw), then reuse the "call it as a method under a Symbol key" trick.

## Approach

1. Check `this` is a function.
2. Normalize `argsArray`:
   - `null`/`undefined` → `[]`;
   - not an object → `TypeError`;
   - otherwise read `length`, and copy indices `0 … length - 1` into a new array (holes read as `undefined`).
3. Normalize `thisArg` exactly like `call` (`globalThis` for nullish, `Object(x)` otherwise).
4. Define the function on the context under a fresh `Symbol`, call it with the spread array, delete the key in `finally`.

## Walkthrough

`Math.max.myApply(null, [3, 9, 4])`:

| Step | Action |
| --- | --- |
| 1 | Copy the array-like into a real arguments array: `[3, 9, 4]` |
| 2 | `ctx` = `globalThis` (because `thisArg` is `null`) |
| 3 | Attach `Math.max` under a symbol key, call it with the spread arguments, delete the key |
| 4 | Returns 9 |

`apply` is `call` with the arguments supplied as one array-like instead of a list; that's the only difference.

## Complexity

`O(n)` to copy `n` arguments.

## Edge cases to test

- Array and array-like argument lists (`{ length: 2, 0: 'a', 1: 'b' }`).
- `null` or `undefined` arguments list means no arguments.
- A primitive arguments list throws.
- `this` handling identical to `call`.

## Pitfalls

- Spreading an array-like directly (`...{ length: 2 }`) throws: spread needs an iterator, array-likes don't have one.
- Accepting strings: `'ab'` is iterable, so `[...'ab']` "works", but native `apply` throws a `TypeError` because it isn't an object.
- `args = argsArray || []` lets `0` and `''` through as "no arguments" instead of throwing.
- Forgetting cleanup on throw, or using a string key that collides with a real property.

## Follow-ups interviewers add

- **`Math.max.apply(null, hugeArray)`:** why does it throw "too many arguments" for millions of items, and how would you chunk it?
- **Implement `apply` with `call`** and vice versa.
- **`Reflect.apply`:** what does it add over `Function.prototype.apply` (works even if `fn.apply` was overwritten)?

## In the interview

Implement it on top of the same symbol trick as `call`, or literally as `this.myCall(thisArg, ...args)`. Mention its historical use for spreading arrays (`Math.max.apply(null, arr)`), replaced by spread syntax.
