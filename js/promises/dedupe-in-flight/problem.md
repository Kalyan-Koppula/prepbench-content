---
title: Dedupe in-flight requests
difficulty: Medium
order: 12
tags: [promises, caching, closures, map]
frequency: medium
exports: [dedupe]
hints:
  - Keep a `Map` from key to the pending promise in a closure; return the stored promise if the key is already there.
  - Remove the entry when the promise settles, whichever way it settles.
  - Store the promise that does the cleanup (for example, `p.finally(...)`) and return that one, so the entry is gone before any caller's callback runs.
---

Several components on a page often ask for the same data at the same moment. Implement `dedupe(fn, getKey)` which wraps an async function so that **concurrent calls with the same key share a single call** to `fn`.

- While a call for a key is in flight, further calls with that key return **the same promise** and do not call `fn`.
- Once that promise settles (fulfilled **or** rejected), the key is forgotten: the next call starts a fresh request. This is not a cache of results.
- `getKey(...args)` turns the arguments into a key. It defaults to `JSON.stringify(args)`.

```js
const getUser = dedupe((id) => fetch(`/api/users/${id}`).then((r) => r.json()))

const a = getUser(7)
const b = getUser(7) // no second request; b === a
const c = getUser(8) // different key: its own request
```

## Notes

- Forward `this` and all arguments to `fn`.
- The entry must already be cleared when callers' `then`/`catch` callbacks run, so a retry made inside a `.catch` starts a new request.
- If `fn` throws synchronously, return a rejected promise and don't remember anything.
- `fn` may return a plain value; the wrapper always returns a promise.
