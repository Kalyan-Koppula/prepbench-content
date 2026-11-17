**Key insight:** normalise the config once (every transition becomes a list of `{ target, guard, action }` candidates) and validate it up front. Then `send` and `can` share one lookup, "first candidate whose guard passes", and the rest is running hooks in a fixed order.

## Approach

1. `candidates(t)`: wrap a single transition in an array and turn strings into `{ target }`.
2. At creation, throw if `initial` or any candidate's `target` isn't a key of `states`; then run the initial `entry`.
3. `pick(event, payload)`: read `states[current].on[event]`, normalise it, and return the first candidate without a guard or with a passing guard.
4. `send`: no candidate means no change. No target means run the action only. Otherwise run `exit`, `action`, switch `current`, run `entry`.
5. `can` is `pick(...) !== undefined`.
6. Expose `state` and `context` as getters so callers always see the live values.

## Pitfalls

- Returning a plain `{ state: current }` object: the property is a snapshot and never changes. Use a getter.
- Checking `states[target]` with `in` or a plain lookup: `'toString'` or `'constructor'` look like valid targets. Use an own-property check.
- Running `entry` before `exit`, or the action after switching state, breaks "stop spinner, then show result" style flows.
- Validating targets lazily inside `send` means a typo only surfaces when that rare event finally fires in production.
- Skipping exit/entry for self-transitions differs from XState's external transitions; follow the spec you're given and say it out loud.

## Follow-ups interviewers add

- **`subscribe(listener)`** to notify UI on every transition (then wire it to React with `useSyncExternalStore`).
- **Delayed transitions** (`after: { 3000: 'idle' }`) using timers that are cleared on exit.
- **Nested and parallel states** (statecharts): what changes in exit/entry order?
- **Invoking promises:** a `loading` state that starts a fetch on entry and sends `OK`/`FAIL` when it settles, ignoring results that arrive after leaving the state.
- **Typed machines:** make `send('TYPO')` a compile error.
