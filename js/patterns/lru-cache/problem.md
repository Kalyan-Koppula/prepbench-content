---
title: LRU Cache
difficulty: Medium
order: 4
tags: [classes, map, linked-list, caching]
frequency: high
exports: [LRUCache]
hints:
  - You need two things in O(1) - find an entry by key, and find the least recently used entry.
  - "A `Map` remembers insertion order, and deleting then re-inserting a key moves it to the end."
  - "`map.keys().next().value` is the oldest key."
---

Implement `LRUCache`, a fixed-size cache that evicts the **least recently used** entry when it runs out of room. Browsers, CDNs and data-fetching libraries all use one.

```js
const cache = new LRUCache(2)
cache.put('a', 1)
cache.put('b', 2)
cache.get('a')    // 1, and 'a' is now the most recently used
cache.put('c', 3) // full: evicts 'b', the least recently used
cache.get('b')    // undefined
cache.size        // 2
```

## Notes

- `new LRUCache(capacity)`: `capacity` must be a positive integer, otherwise throw a `RangeError`.
- `get(key)` returns the value, or `undefined` if the key isn't cached. A hit makes the key the most recently used; a miss changes nothing.
- `put(key, value)` inserts or updates and makes the key the most recently used. If inserting a **new** key would exceed the capacity, evict the least recently used key first. Updating an existing key never evicts anything.
- `size` is the number of cached entries.
- Keys can be any value (compare them like a `Map` does: `1` and `'1'` are different, objects by reference).
- `get` and `put` must run in **O(1)**. The last test times 120 000 operations on a cache of 30 000 entries.
