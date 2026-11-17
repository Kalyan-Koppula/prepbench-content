**Key insight:** the debounced function must be created *once*, and everything that changes between renders (`fn`, `delay`) is read through refs at call time.

## Approach

Refs hold the latest `fn` and `delay` (updated in an effect after every render), the timer id and the pending arguments. A lazy `useState(() => ...)` builds the debounced function a single time: each call stores its arguments, clears the old timer and starts a new one that runs `fnRef.current(...args)`. `cancel` clears the timer and the arguments; `flush` returns early if no timer is pending, otherwise clears it and runs immediately. An unmount-only effect calls `cancel`.

## Pitfalls

- `useCallback(debounce(fn, delay), [])`: identity is stable but `fn` is frozen from the first render, so it saves to the *first* `noteId` forever.
- `useMemo(() => debounce(fn, delay), [fn, delay])` with an inline `fn` creates a new debouncer every render; each keystroke gets its own timer and nothing is debounced.
- `useMemo` is a performance hint, not a guarantee; React may throw the cached value away. A lazy `useState` or a ref is a real "once".
- No cleanup: a save fires after the editor has closed, possibly against a different note.

## Follow-ups

- `leading` / `trailing` / `maxWait` options (what lodash supports).
- Should a pending call be *flushed* rather than cancelled on unmount? (For autosave, usually yes.)
- Return a promise from the debounced function that resolves with `fn`'s result.
