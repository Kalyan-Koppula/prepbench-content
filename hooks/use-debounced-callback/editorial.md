**Key insight:** the debounced function must be created *once*, and everything that changes between renders (`fn`, `delay`) is read through refs at call time.

## Approach

Refs hold the latest `fn` and `delay` (updated in an effect after every render), the timer id and the pending arguments. A lazy `useState(() => ...)` builds the debounced function a single time: each call stores its arguments, clears the old timer and starts a new one that runs `fnRef.current(...args)`. `cancel` clears the timer and the arguments; `flush` returns early if no timer is pending, otherwise clears it and runs immediately. An unmount-only effect calls `cancel`.

## Walkthrough

```jsx
const save = useDebouncedCallback((text) => api.saveDraft(text), 500)
<textarea onChange={(e) => save(e.target.value)} />
```

| Concern | How the hook handles it |
| --- | --- |
| Stable identity | The debounced function is created once (`useState` initialiser), so it can be passed to memoised children and used in effects |
| Latest `fn` | `fnRef` is updated every render, so the call always uses the newest closure (current props and state) |
| Latest arguments | `pendingArgs` keeps the arguments of the last call |
| Unmount | The pending timer is cleared (or flushed, depending on the spec) |

Creating `debounce(fn)` directly in the component body would make a new debounced function (with a new timer) on every render, so nothing would ever be debounced.

## What to test

- Several calls within the delay run once with the last arguments.
- The latest `fn` is used even if it changed after the call.
- The returned function's identity is stable.
- `cancel` and `flush`, and cleanup on unmount.

## Pitfalls

- `useCallback(debounce(fn, delay), [])`: identity is stable but `fn` is frozen from the first render, so it saves to the *first* `noteId` forever.
- `useMemo(() => debounce(fn, delay), [fn, delay])` with an inline `fn` creates a new debouncer every render; each keystroke gets its own timer and nothing is debounced.
- `useMemo` is a performance hint, not a guarantee; React may throw the cached value away. A lazy `useState` or a ref is a real "once".
- No cleanup: a save fires after the editor has closed, possibly against a different note.

## Follow-ups

- `leading` / `trailing` / `maxWait` options (what lodash supports).
- Should a pending call be *flushed* rather than cancelled on unmount? (For autosave, usually yes.)
- Return a promise from the debounced function that resolves with `fn`'s result.

## In the interview

The key point is the ref pattern: a stable function that reads the latest callback from a ref. It's the same idea as React's experimental `useEffectEvent`.
