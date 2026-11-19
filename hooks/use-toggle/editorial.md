**Key insight:** derive the next value from the *previous state* (functional update), not from the `on` captured in the closure, and only treat a genuine boolean as an explicit value.

## Approach

`useState(initial)` holds the flag. `toggle` is a `useCallback` with an empty dependency list that calls `setOn(prev => typeof next === 'boolean' ? next : !prev)`. Because it never reads `on` directly it needs no dependencies, so its identity is stable and multiple calls in one batch each see the result of the previous one.

## Walkthrough

```jsx
const [open, toggle] = useToggle()
toggle()      // true
toggle()      // false
toggle(true)  // true (explicit value)
<button onClick={toggle}>…</button> // careful: receives the click event
```

The last line is the subtle case: `onClick={toggle}` passes the event object, which isn't a boolean, so the hook treats it as "flip". Checking `typeof next === 'boolean'` makes both `toggle()` and `toggle(event)` flip, while `toggle(true)` sets explicitly.

## What to test

- Flipping, explicit `true`/`false`.
- Passing it directly as an event handler.
- Stable `toggle` identity.

## Pitfalls

- `setOn(!on)` reads a stale `on`: three calls in one handler all compute the same value.
- `next ?? !prev` breaks when `toggle` is used as `onClick`, because the event object is not nullish and becomes the new "value".
- Listing `on` as a dependency makes `toggle` change on every flip, defeating `React.memo` children.

## Follow-ups

- Return explicit `setOn` / `setOff` helpers as well, or an object instead of a tuple.
- Generalise to `useCycle(['light', 'dark', 'system'])`.
- When would you choose `useReducer` here instead? (`useReducer((v) => !v, false)` gives a stable dispatch for free.)

## In the interview

Small hook, but interviewers check the event-object case and the functional update. Offer the variant returning `{ on, toggle, setOn, setOff }` for readability.
