---
title: useFetch
difficulty: Hard
order: 17
tags: [useEffect, AbortController, race-conditions, fetch]
frequency: high
hook: useFetch
hints:
  - Create an `AbortController` inside the effect, pass its `signal` to `fetch`, and call `abort()` in the cleanup. React runs that cleanup on URL change and on unmount.
  - An aborted fetch rejects with an error named `AbortError`. That is expected, not a failure to show.
  - '`fetch` only rejects on network errors; check `response.ok` yourself and turn a 404/500 into an error.'
---

Implement `useFetch(url)`. It fetches `url`, parses the JSON body and returns `{ data, error, loading }`.

```jsx
function Profile({ userId }) {
  const { data: user, error, loading } = useFetch(`/api/users/${userId}`)
  if (loading) return <Spinner />
  if (error) return <p>Could not load: {error.message}</p>
  return <h1>{user.name}</h1>
}
```

Requirements:

- When `url` changes, the previous request is **aborted** (pass an `AbortSignal` to `fetch`), `data` and `error` are cleared, and `loading` is `true` until the new request settles.
- A response from an old URL must never show up, even one that arrives after the newer one.
- Unmounting aborts the in-flight request.
- A non-2xx response sets `error` to an `Error` whose message includes the status code (e.g. `"HTTP 404"`). Network errors set `error` too. An abort is **not** an error.
- If `url` is `null`, don't fetch: `{ data: undefined, error: undefined, loading: false }`.
