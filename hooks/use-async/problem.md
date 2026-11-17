---
title: useAsync
difficulty: Medium
order: 16
tags: [async, race-conditions, useRef, useState]
frequency: high
hook: useAsync
hints:
  - Keep `status`, `data` and `error` in state, and the latest `asyncFn` in a ref so `run` can stay stable.
  - Give every call to `run` an increasing id and remember the latest id in a ref.
  - When a promise settles, only update state if its id is still the latest one (and the component is still mounted).
---

Implement `useAsync(asyncFn)`. It returns `{ run, status, data, error }`. Calling `run(...args)` calls `asyncFn(...args)` and tracks the promise it returns.

```jsx
function UserSearch() {
  const { run, status, data, error } = useAsync((q) => api.searchUsers(q))
  return (
    <>
      <input onChange={(e) => run(e.target.value)} />
      {status === 'pending' && <Spinner />}
      {status === 'error' && <p>{error.message}</p>}
      {data && <UserList users={data} />}
    </>
  )
}
```

| `status` | When | `data` / `error` |
|---|---|---|
| `'idle'` | before the first `run` | both `undefined` |
| `'pending'` | after `run`, until it settles | keep their previous values |
| `'success'` | it resolved | `data` = result, `error` = `undefined` |
| `'error'` | it rejected | `error` = reason, `data` = `undefined` |

Requirements:

- **Only the latest run counts.** If `run` is called again before an earlier promise settles, the earlier result or error is ignored, whatever order they settle in.
- `run` never throws or returns a rejected promise. Errors go into `error`.
- `run` keeps the same identity across renders and always calls the latest `asyncFn`.
- Nothing updates after the component unmounts.
