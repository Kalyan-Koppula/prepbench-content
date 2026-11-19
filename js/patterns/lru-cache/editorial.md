**Key insight:** you need a hash map (find by key) and an ordering (find the oldest) that both update in O(1). In JavaScript a single `Map` gives you both, because it iterates in insertion order and `delete` + `set` moves a key to the end.

## Approach

1. Keep `entries: Map<K, V>` ordered from least to most recently used.
2. `get`: on a hit, delete the key and set it again (moving it to the end), then return the value.
3. `put`: if the key exists, delete it (it will be re-added at the end). Otherwise, if the map is full, delete the first key, `entries.keys().next().value`. Then `set`.

## Walkthrough

Capacity 2:

| Operation | Map order (oldest → newest) | Note |
| --- | --- | --- |
| `put(1, 'a')` | 1 | |
| `put(2, 'b')` | 1, 2 | |
| `get(1)` | 2, 1 | reading moves 1 to the newest end |
| `put(3, 'c')` | 1, 3 | full: evict the oldest key, 2 |
| `get(2)` | 1, 3 | miss: `undefined` |
| `put(1, 'z')` | 3, 1 | update moves 1 to the newest end |

A JavaScript `Map` iterates in insertion order, so deleting and re-inserting a key marks it as most recently used, and `keys().next()` is the least recently used.

## Complexity

`O(1)` for `get` and `put`.

## Edge cases to test

- Eviction of the least recently used key.
- `get` refreshes recency; a miss returns `undefined`.
- Updating an existing key doesn't evict anything.
- Capacity 1.
- Invalid capacities throw.

## Pitfalls

- An array of keys with `indexOf`/`splice` to track order is O(n) per operation; the last test runs long enough to expose it.
- `if (this.entries.get(key))` treats cached `0`, `''` or `false` as misses. Use `has`.
- Evicting on every `put` when full, even for an existing key, throws away an entry you didn't need to.
- Moving a key on a **miss**, or forgetting to move it on a hit.

## Follow-ups interviewers add

- **"Without relying on Map order":** implement a hash map plus a doubly linked list with sentinel head and tail nodes. Each map value points at its list node, so moving and removing are O(1). Many interviewers ask for this version explicitly.
- **TTL:** entries also expire after `maxAge` ms (store a timestamp, check on `get`).
- **`onEvict(key, value)` callback**, for example to revoke object URLs.
- **Size by weight:** capacity in bytes instead of entries.
- **LFU** (least *frequently* used), which needs frequency buckets to stay O(1).

## In the interview

In a JavaScript interview, the `Map` trick is accepted. In a language-neutral or senior interview, also describe the classic structure: a hash map from key to node plus a doubly linked list ordered by recency (see the [LRU Cache](/problems/lru-cache) DSA problem).
