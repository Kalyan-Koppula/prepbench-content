---
title: "Two weeks to the JS round"
summary: "Fourteen days, about 90 minutes each: read, implement, predict, drill."
order: 1
kind: plan
sections:
  - title: "Day 1: How the round works, and closures"
    items:
      - read: js-round-playbook
      - read: closures-and-scope
      - js: once
      - js: memoize
      - output: var-hoisting-undefined
      - output: settimeout-var-vs-let
      - output: closures-capture-variables
      - output: counter-factory
      - output: block-scope-if
      - output: tdz-shadows-outer
      - deck: fe-javascript
  - title: "Day 2: this and binding"
    items:
      - read: this-binding
      - js: function-call
      - js: function-apply
      - js: function-bind
      - output: method-extraction
      - output: arrow-in-object-literal
      - output: call-apply-bind
      - output: bind-twice
      - output: settimeout-callbacks
      - output: class-method-as-callback
      - deck: fe-javascript
  - title: "Day 3: The event loop and timers"
    items:
      - read: event-loop
      - js: debounce
      - js: throttle
      - js: debounce-advanced
      - output: promise-vs-timeout
      - output: executor-runs-synchronously
      - output: microtasks-between-timers
      - output: timer-delays
      - output: forgotten-return-in-then
      - deck: fe-async
  - title: "Day 4: Promise combinators"
    items:
      - read: promises-and-async
      - js: promise-all
      - js: promise-race
      - js: promise-all-settled
      - js: promisify
      - output: promise-all-input-order
      - output: then-second-arg-vs-catch
      - output: finally-pass-through
      - output: resolve-called-twice
      - output: boss-timers-and-promises
      - deck: fe-async
  - title: "Day 5: async/await"
    items:
      - read: solving-output-questions
      - js: promise-with-timeout
      - js: retry-with-backoff
      - js: run-in-sequence
      - output: await-non-promise
      - output: async-returns-promise
      - output: forgot-await
      - output: await-vs-then-interleave
      - output: sequential-vs-parallel-await
      - output: async-foreach-vs-for-of
      - output: boss-nested-async
      - deck: fe-async
  - title: "Day 6: Concurrency patterns"
    items:
      - read: async-patterns-cookbook
      - js: async-pool
      - js: dedupe-in-flight
      - js: my-promise
      - js: cancellable-task
      - output: try-catch-await
      - output: return-await-in-try
      - deck: fe-async
  - title: "Day 7: Array polyfills, then the first phone screen"
    items:
      - read: polyfills-cheatsheet
      - js: array-map
      - js: array-filter
      - js: array-reduce
      - js: array-flat
      - output: array-methods-mutate-or-copy
      - output: sort-default-comparator
      - output: default-sort
      - deck: fe-javascript
  - title: "Day 8: Objects and references"
    items:
      - read: equality-and-types
      - js: deep-clone
      - js: deep-equal
      - js: get-by-path
      - js: flatten-array
      - js: deep-merge
      - output: reference-vs-copy
      - output: spread-shallow-copy
      - output: object-equality
      - output: json-stringify-drops
      - output: mutating-function-args
      - deck: fe-javascript
  - title: "Day 9: Prototypes and classes"
    items:
      - read: prototypes-and-classes
      - js: object-create
      - js: my-new
      - js: my-instanceof
      - output: chain-lookup-shadowing
      - output: shared-prototype-state
      - output: modify-prototype-later
      - output: super-calls
      - output: class-vs-function
      - output: private-fields
      - deck: fe-javascript
  - title: "Day 10: Coercion, then TypeScript"
    items:
      - read: typescript-for-frontend-interviews
      - type: my-pick
      - type: my-readonly
      - type: my-omit
      - output: loose-vs-strict
      - output: plus-operator
      - output: typeof-quirks
      - output: float-precision
      - output: nan-comparisons
      - output: objects-plus
      - output: truthy-but-equal-false
      - output: nullish-vs-or
      - deck: fe-typescript
  - title: "Day 11: Patterns and state"
    items:
      - js: event-emitter
      - js: lru-cache
      - js: create-store
      - js: curry
      - output: generator-laziness
      - output: spreading-iterables
      - deck: fe-javascript
  - title: "Day 12: DOM and events"
    items:
      - read: dom-api-cheat-sheet
      - read: events-and-delegation
      - js: get-elements-by-class-name
      - js: find-corresponding-node
      - js: event-delegation
      - js: render-virtual-node
      - deck: fe-browser-dom
  - title: "Day 13: React hooks"
    items:
      - read: hooks-in-depth
      - hook: use-previous
      - hook: use-debounced-value
      - hook: use-interval
      - hook: use-local-storage
      - hook: use-fetch
      - deck: fe-react
  - title: "Day 14: Gaps, then the second phone screen"
    items:
      - read: testing-and-debugging-live
      - js: classnames
      - js: compose-and-pipe
      - type: my-awaited
      - type: deep-readonly
      - deck: fe-css
      - deck: fe-web-platform
      - deck: fe-html
---

Each day mixes the four things a first round tests: one or two cheat sheets, three to five implementations, a handful of output puzzles, and a deck to drill. Do the coding items with the timer running and talk out loud as you would with an interviewer.

Run the **45-minute phone screen** from the Frontend page at the end of day 7 and again on day 14. Flashcards you miss come back on their own, so ten minutes of review a day keeps the earlier days fresh.
