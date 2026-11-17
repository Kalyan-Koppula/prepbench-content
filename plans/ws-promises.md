---
title: "Promises"
summary: "Combinators, chaining, errors, and writing a Promise yourself."
order: 13
kind: worksheet
sections:
  - title: "Read"
    items:
      - read: promises-and-async
  - title: "Code"
    items:
      - js: promise-all
      - js: promise-all-settled
      - js: promise-any
      - js: promise-race
      - js: promise-finally
      - js: promisify
      - js: my-promise
  - title: "Predict"
    items:
      - output: promise-all-input-order
      - output: promise-all-fail-fast
      - output: promise-race-first-settled
      - output: then-second-arg-vs-catch
      - output: finally-pass-through
      - output: resolve-called-twice
      - output: executor-throws
      - output: then-non-function-args
  - title: "Drill"
    items:
      - deck: fe-async
---


