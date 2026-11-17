**Key insight:** a media query is an external store. Read it synchronously for the first render, then subscribe to the *same* `MediaQueryList` you'll later unsubscribe from.

## Approach

Initialise state lazily with `window.matchMedia(query).matches` so nothing flashes. An effect keyed on `query` creates the `MediaQueryList`, defines `onChange = () => setMatches(mql.matches)`, calls it once (to sync after a query change, or a change that happened between render and effect), subscribes with `addEventListener('change', onChange)`, and returns a cleanup that removes it from that same `mql`.

## Pitfalls

- `useState(false)` plus an effect: the first paint is wrong, which is visible as a layout jump on desktop.
- Calling `window.matchMedia(query)` again in the cleanup. It returns a *new* `MediaQueryList`, so `removeEventListener` on it removes nothing and the old listener leaks.
- Forgetting to re-sync when `query` changes: the state still holds the old query's answer until the next `change` event.
- Old Safari (before 14) only had `addListener`/`removeListener`; production hooks feature-detect.

## Follow-ups

- Rewrite with `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`, which also solves tearing and SSR.
- SSR: what should `getServerSnapshot` return, and how do you avoid a hydration mismatch?
- `useBreakpoint()` that returns `'sm' | 'md' | 'lg'` from several queries.
