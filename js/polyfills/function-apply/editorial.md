**Key insight:** `apply` is `call` plus argument normalization. Turn whatever you're given into a real array first (or throw), then reuse the "call it as a method under a Symbol key" trick.

## Approach

1. Check `this` is a function.
2. Normalize `argsArray`:
   - `null`/`undefined` → `[]`;
   - not an object → `TypeError`;
   - otherwise read `length`, and copy indices `0 … length - 1` into a new array (holes read as `undefined`).
3. Normalize `thisArg` exactly like `call` (`globalThis` for nullish, `Object(x)` otherwise).
4. Define the function on the context under a fresh `Symbol`, call it with the spread array, delete the key in `finally`.

## Pitfalls

- Spreading an array-like directly (`...{ length: 2 }`) throws: spread needs an iterator, array-likes don't have one.
- Accepting strings: `'ab'` is iterable, so `[...'ab']` "works", but native `apply` throws a `TypeError` because it isn't an object.
- `args = argsArray || []` lets `0` and `''` through as "no arguments" instead of throwing.
- Forgetting cleanup on throw, or using a string key that collides with a real property.

## Follow-ups interviewers add

- **`Math.max.apply(null, hugeArray)`:** why does it throw "too many arguments" for millions of items, and how would you chunk it?
- **Implement `apply` with `call`** and vice versa.
- **`Reflect.apply`:** what does it add over `Function.prototype.apply` (works even if `fn.apply` was overwritten)?
