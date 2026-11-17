---
title: State Machine
difficulty: Medium
order: 9
tags: [state, closures, validation]
frequency: medium
exports: [createMachine]
hints:
  - Normalise every transition into an array of `{ target, guard, action }` objects, so `send` has a single code path.
  - Validate all targets once, when the machine is created.
  - "On a transition with a target: exit the old state, run the action, switch, enter the new state - in that order."
---

Implement `createMachine(config)`, a finite state machine with guards and entry/exit actions, in the spirit of XState. UI flows like "idle -> loading -> success/error" stop growing impossible states once they're modelled this way.

```js
const fetcher = createMachine({
  initial: 'idle',
  context: { retries: 0 },
  states: {
    idle: { on: { FETCH: 'loading' } },
    loading: {
      entry: (ctx) => console.log('start spinner'),
      exit: (ctx) => console.log('stop spinner'),
      on: { OK: 'success', FAIL: 'failure' },
    },
    failure: {
      on: {
        RETRY: { target: 'loading', guard: (ctx) => ctx.retries < 3, action: (ctx) => ctx.retries++ },
      },
    },
    success: {},
  },
})

fetcher.send('FETCH') // logs "start spinner", returns 'loading'
fetcher.send('OK')    // logs "stop spinner", returns 'success'
fetcher.state         // 'success'
```

## Notes

**Config:** `initial` (a state name), optional `context` (an object, default `{}`), and `states`. Each state may have `entry(context, payload)`, `exit(context, payload)` and `on`, which maps event names to a transition:

- a string: the target state;
- an object `{ target?, guard?, action? }`, where `guard(context, payload)` returns a boolean and `action(context, payload)` runs during the transition;
- an array of such objects (or strings): the **first** one whose guard passes (or that has no guard) is taken.

**The machine** has `state` (current state name), `context` (the same object across transitions; actions may mutate it), `send(event, payload?)` and `can(event, payload?)`.

- `createMachine` throws an `Error` if `initial` or any `target` isn't a key of `states`. It runs the initial state's `entry` with `payload` `undefined`.
- `send` looks up the event in the **current** state's `on`. If there's no such event, or every guard fails, nothing happens.
- Taking a transition **with** a target runs, in order: the current state's `exit`, the transition's `action`, then the target's `entry`. This happens even when the target is the current state (a self-transition).
- A transition **without** a target runs only its `action` and stays put; no `exit` or `entry`.
- `send` returns the state name after handling the event.
- `can(event, payload?)` returns whether `send` would take a transition, without running anything.
