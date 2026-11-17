---
title: "async/await and concurrency"
summary: "Ordering after await, sequential vs parallel, pools, retries and cancellation."
order: 14
kind: worksheet
sections:
  - title: "Read"
    items:
      - read: async-patterns-cookbook
  - title: "Code"
    items:
      - js: promise-with-timeout
      - js: retry-with-backoff
      - js: async-pool
      - js: run-in-sequence
      - js: dedupe-in-flight
      - js: cancellable-task
      - js: poll-until
      - js: priority-task-queue
      - js: rate-limited-queue
  - title: "Predict"
    items:
      - output: await-non-promise
      - output: async-returns-promise
      - output: forgot-await
      - output: await-vs-then-interleave
      - output: sequential-vs-parallel-await
      - output: async-foreach-vs-for-of
      - output: await-sleep-in-loop
      - output: try-catch-await
      - output: return-await-in-try
      - output: rejection-caught-later
      - output: boss-nested-async
      - output: boss-allsettled-workers
  - title: "Drill"
    items:
      - deck: fe-async
---


