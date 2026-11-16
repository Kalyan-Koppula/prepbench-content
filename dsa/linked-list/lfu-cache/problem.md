---
title: LFU Cache
difficulty: Hard
order: 14
lists: [striver]
tags: [design, hash-map, doubly-linked-list]
leetcode: lfu-cache
kind: class
class: LFUCache
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
  - Group keys by their use count. Within one count, you still need least-recently-used order — what gave you that in LRU Cache?
  - Keep `count -> ordered set of keys` plus the smallest count currently in use. When does that minimum change?
  - A new key always has count 1, so after an insertion the minimum count is 1.
complexity: { time: "O(1) per operation", space: "O(capacity)" }
---

Design a cache with a fixed `capacity` that evicts the **least frequently used** key when it's full.

Each key has a use counter. Inserting a new key sets its counter to `1`; every `get` hit and every `put` that updates an existing key adds `1`.

- `get(key)` returns the value for `key`, or `-1` if it isn't cached.
- `put(key, value)` updates the value if `key` exists. Otherwise, if the cache is already at `capacity`, first evict the key with the smallest counter — breaking ties by evicting the one **least recently used** — then insert the new key.

Both operations should run in **O(1)** average time.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `1 <= capacity <= 10^4`
- `0 <= key <= 10^5`, `0 <= value <= 10^9`
- At most `2 * 10^5` calls in total.
