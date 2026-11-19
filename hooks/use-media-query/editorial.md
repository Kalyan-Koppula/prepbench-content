**Key insight:** a media query is an external store. Read it synchronously for the first render, then subscribe to the *same* `MediaQueryList` you'll later unsubscribe from.

## Approach

Initialise state lazily with `window.matchMedia(query).matches` so nothing flashes. An effect keyed on `query` creates the `MediaQueryList`, defines `onChange = () => setMatches(mql.matches)`, calls it once (to sync after a query change, or a change that happened between render and effect), subscribes with `addEventListener('change', onChange)`, and returns a cleanup that removes it from that same `mql`.

## Walkthrough

```jsx
const isWide = useMediaQuery('(min-width: 900px)')
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
```

| Event | Effect |
| --- | --- |
| first render | reads `matchMedia(query).matches` synchronously, so there's no flash of the wrong layout on the client |
| viewport crosses 900px | `change` fires, state updates |
| `query` prop changes | re-subscribe and re-read |

On the server there's no `window`, so server-rendered apps need a default value and must accept a possible hydration mismatch, or render both variants with CSS.

## What to test

- Initial value matches the current media state.
- Updates on change.
- Query changes re-subscribe.
- Cleanup removes the listener.

## Pitfalls

- `useState(false)` plus an effect: the first paint is wrong, which is visible as a layout jump on desktop.
- Calling `window.matchMedia(query)` again in the cleanup. It returns a *new* `MediaQueryList`, so `removeEventListener` on it removes nothing and the old listener leaks.
- Forgetting to re-sync when `query` changes: the state still holds the old query's answer until the next `change` event.
- Old Safari (before 14) only had `addListener`/`removeListener`; production hooks feature-detect.

## Follow-ups

- Rewrite with `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`, which also solves tearing and SSR.
- SSR: what should `getServerSnapshot` return, and how do you avoid a hydration mismatch?
- `useBreakpoint()` that returns `'sm' | 'md' | 'lg'` from several queries.

## In the interview

Prefer CSS media and container queries for layout; use this hook only when JavaScript behaviour must change. For SSR, mention `useSyncExternalStore` with a `getServerSnapshot`.
