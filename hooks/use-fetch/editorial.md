**Key insight:** the effect's cleanup *is* your cancellation. One `AbortController` per effect run, aborted in the cleanup, handles URL changes, unmounts and out-of-order responses in one place.

## Approach

An effect keyed on `[url]` returns early (resetting state) for `null`. Otherwise it creates an `AbortController`, sets `{ loading: true }` with `data`/`error` cleared, and starts an async `load()`: `fetch(url, { signal })`, throw `HTTP <status>` when `!res.ok`, `await res.json()`, then set data, but only if the signal isn't aborted (the body may finish parsing just after a URL change). The `catch` returns quietly for aborts and stores anything else as `error`. The cleanup calls `controller.abort()`. React runs it before the next effect and on unmount, so the old request is cancelled at the network level and its result is ignored.

## Pitfalls

- No abort and no "ignore" flag: a slow first request can land after the fast second one and overwrite it.
- Treating `AbortError` as a failure flashes an error message on every URL change.
- Assuming `fetch` rejects on 404/500. It doesn't; only network failures reject.
- Keeping the old `data` while the new URL loads shows user 1's profile under user 2's heading.
- Making the effect callback itself `async`: it then returns a promise instead of a cleanup function.
- Putting an inline `options` object in the dependency array refetches on every render.

## Follow-ups

- Add `refetch()` and a request-init argument without causing refetch loops (keep `init` in a ref or key on a serialised form).
- Cache responses by URL and dedupe concurrent requests (what SWR / React Query do).
- In React 18+ Strict Mode development, effects mount twice. What does the network tab show, and why is that fine here?
