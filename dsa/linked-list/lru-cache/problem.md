---
title: LRU Cache
difficulty: Medium
order: 10
lists: [neetcode150, striver]
tags: [design, hash-map, doubly-linked-list]
leetcode: lru-cache
kind: class
class: LRUCache
params:
  - { name: capacity, type: number }
methods:
  - name: get
    params: [{ name: key, type: number }]
    returns: number
  - name: put
    params: [{ name: key, type: number }, { name: value, type: number }]
    returns: void
hints:
  - You need O(1) lookup by key *and* O(1) "move to most-recent". Which two structures give you each?
  - A JS `Map` iterates in insertion order — deleting and re-inserting a key makes it the newest.
complexity: { time: "O(1) per operation", space: "O(capacity)" }
---

Design a cache with a fixed `capacity` that evicts the **least recently used** key when full.

- `get(key)` returns the value for `key`, or `-1` if absent. A successful `get` marks the key as most recently used.
- `put(key, value)` inserts or updates `key`, marking it most recently used. If this pushes the size past `capacity`, evict the least recently used key.

Both operations must run in **O(1)** average time.

Tests are a sequence of operations: the first creates the cache, and the output lists each call's return value (`null` for the constructor and `put`).

## Constraints

- `1 <= capacity <= 3000`
- `0 <= key <= 10^4`, `0 <= value <= 10^5`
- At most `2 * 10^5` calls in total.
