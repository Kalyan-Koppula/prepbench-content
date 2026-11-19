**Key insight:** subscribe a stable wrapper that forwards to `handlerRef.current`. The subscription then depends only on *where* and *what* you listen to, never on the handler.

## Approach

Mirror `handler` into a ref in an effect. In a second effect, resolve the target: `undefined` means `window`, an object with a `current` key is a ref, anything else is used as-is. Bail out if it's null. Add `listener = (e) => saved.current(e)` with the options and return a cleanup that removes the *same* `listener` with the same `capture` flag. Key that effect on `eventName`, `target` and the option primitives (`capture`, `passive`, `once`) rather than the options object, so an inline `{ passive: true }` doesn't resubscribe every render.

## Walkthrough

```jsx
useEventListener('keydown', (e) => { if (e.key === 'Escape') close() })   // window
useEventListener('scroll', onScroll, containerRef, { passive: true })    // an element via a ref
```

| Change between renders | Re-subscribe? |
| --- | --- |
| A new handler function (every render, typically) | no: the ref is updated instead |
| `eventName`, target or options change | yes: remove the old listener, add a new one |

Without the handler ref, every render would remove and re-add the listener, which is wasteful and can drop events between the two operations.

## What to test

- The handler sees the latest props and state.
- No re-subscription when only the handler changes.
- Window default, element and ref targets.
- Options (`passive`, `capture`, `once`) applied; cleanup removes with the same `capture`.
- Unmount removes the listener.

## Pitfalls

- Reading `ref.current` during render: on the first render it is still `null`. Read it inside the effect, after commit.
- Putting `handler` in the dependency list removes and re-adds the listener on every render when callers pass inline arrows.
- `removeEventListener(name, listener)` without `capture: true` silently leaves a capture listener attached, so it leaks and keeps firing.
- Removing a *different* function than you added (for example a fresh `(e) => handler(e)` in the cleanup).

## Follow-ups

- Support a ref whose element changes without a re-render (pass a callback ref, or state holding the node, instead).
- Type it in TypeScript so `useEventListener('keydown', e => e.key)` infers `KeyboardEvent` (overloads on `WindowEventMap` / `HTMLElementEventMap`).
- Use `AbortController` with `{ signal }` instead of `removeEventListener`.

## In the interview

Point out the subtle cleanup detail: `removeEventListener` must use the same `capture` flag. Mention `AbortController` signals as an alternative for removing many listeners at once.
