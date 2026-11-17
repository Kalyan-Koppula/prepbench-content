**Key insight:** the map stores *promises*, not results. While a promise is in the map, everyone gets that same promise; the promise removes itself from the map when it settles. That one-line lifetime rule is the whole difference between request dedupe and a cache.

## Approach

1. Close over `inFlight = new Map()`.
2. In the wrapper (a regular `function`, for `this`), compute the key; if the map has it, return the stored promise.
3. Otherwise call `fn.apply(this, args)` inside `try` (a synchronous throw returns `Promise.reject(error)` without touching the map).
4. Build `shared = Promise.resolve(result).finally(() => inFlight.delete(key))`, store it and return it.

Because callers subscribe to `shared`, and `shared` only settles after its `finally` callback has run, the key is gone by the time their callbacks run.

## Pitfalls

- Storing `result` and cleaning up with a separate `result.finally(...)` that nobody handles: on rejection, that side chain becomes an unhandled rejection, and callers may run before the delete.
- Only clearing on success: a failed request is then "cached" forever and every later call gets the old error.
- Keying with `args[0]` and silently merging calls that differ in later arguments.
- Using an object as the key without a key function: two equal-looking objects are different `Map` keys.

## Follow-ups interviewers add

- **Short-lived cache:** keep results for `ttl` ms after success (stale-while-revalidate).
- **Cancellation with shared requests:** only abort the underlying fetch when *every* caller has aborted (reference counting).
- **Where does this live in a React app?** It is the core of SWR/React Query request deduping.
- **Memory:** `JSON.stringify` keys and cyclic arguments; when to require an explicit key.
