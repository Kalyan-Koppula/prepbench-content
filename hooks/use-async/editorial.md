**Key insight:** async results arrive in any order. Tag each request, and let only the most recent tag write to state.

## Approach

One state object `{ status, data, error }`. Refs hold the latest `asyncFn`, a counter `latest` and a `mounted` flag. `run` (a `useCallback` with no deps) takes `id = ++latest.current`, sets `status: 'pending'` (keeping data and error), calls `fnRef.current(...args)` wrapped in `Promise.resolve` with a try/catch so a synchronous throw becomes a rejection, and in both `then` branches writes state only if `mounted.current && id === latest.current`. The rejection handler swallows the error into state, so `run` never produces an unhandled rejection.

## Pitfalls

- No request tagging: type "re", then "react"; if "re" responds last, the list shows results for the wrong query.
- Updating `status` to `'error'` from a stale rejection, flashing an error banner while the real request is still loading.
- Putting `asyncFn` in `useCallback`'s deps when callers pass inline functions makes `run` unstable, which then loops if `run` is in an effect's deps.
- A `mounted` ref alone is not enough. It prevents post-unmount updates but not out-of-order ones.
- Re-throwing from `run` (or returning the raw promise) gives callers unhandled rejections they didn't ask for.

## Follow-ups

- Return a promise from `run` that resolves with the result, or with nothing when superseded.
- Actually cancel the stale request with `AbortController` (see `useFetch`).
- An `immediate` option / dependency array to run automatically, as React Query and SWR do.
