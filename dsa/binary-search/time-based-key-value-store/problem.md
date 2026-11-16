---
title: Time Based Key-Value Store
difficulty: Medium
order: 8
lists: [neetcode150]
tags: [design, binary-search, hash-map]
leetcode: time-based-key-value-store
kind: class
class: TimeMap
params: []
methods:
  - name: set
    params: [{ name: key, type: string }, { name: value, type: string }, { name: timestamp, type: number }]
    returns: void
  - name: get
    params: [{ name: key, type: string }, { name: timestamp, type: number }]
    returns: string
hints:
  - Store every version of a key, not just the latest. What order do they arrive in?
  - Timestamps only increase, so each key's history is already sorted — binary search it for the last entry at or before the query time.
complexity: { time: "O(1) set, O(log n) get", space: "O(n)" }
---

Design a key-value store that remembers every value a key has ever held, and can answer "what was the value at time `t`?".

- `TimeMap()` creates an empty store.
- `set(key, value, timestamp)` records that `key` held `value` from `timestamp` onwards.
- `get(key, timestamp)` returns the value from the `set` call on `key` with the **largest** timestamp that is `<= timestamp`. If there is no such call, return the empty string `""`.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `1 <= key.length, value.length <= 100`; keys and values use lowercase letters and digits.
- `1 <= timestamp <= 10^7`
- Timestamps passed to `set` are strictly increasing across all calls.
- At most `2 * 10^5` calls in total.
