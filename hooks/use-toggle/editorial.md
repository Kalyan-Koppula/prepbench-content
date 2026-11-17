**Key insight:** derive the next value from the *previous state* (functional update), not from the `on` captured in the closure, and only treat a genuine boolean as an explicit value.

## Approach

`useState(initial)` holds the flag. `toggle` is a `useCallback` with an empty dependency list that calls `setOn(prev => typeof next === 'boolean' ? next : !prev)`. Because it never reads `on` directly it needs no dependencies, so its identity is stable and multiple calls in one batch each see the result of the previous one.

## Pitfalls

- `setOn(!on)` reads a stale `on`: three calls in one handler all compute the same value.
- `next ?? !prev` breaks when `toggle` is used as `onClick`, because the event object is not nullish and becomes the new "value".
- Listing `on` as a dependency makes `toggle` change on every flip, defeating `React.memo` children.

## Follow-ups

- Return explicit `setOn` / `setOff` helpers as well, or an object instead of a tuple.
- Generalise to `useCycle(['light', 'dark', 'system'])`.
- When would you choose `useReducer` here instead? (`useReducer((v) => !v, false)` gives a stable dispatch for free.)
