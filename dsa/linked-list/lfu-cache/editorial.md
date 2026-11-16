**Key insight:** bucket keys by use count, and keep each bucket in recency order (an LRU list per count). Track `minFreq`: eviction pops the oldest key from bucket `minFreq`. All updates are a constant number of map/set operations.

## Approach

State: `values: key -> value`, `freq: key -> count`, `buckets: count -> Set<key>` (a JS `Set` iterates in insertion order, so its first element is that bucket's least recently used key), and `minFreq`.

- **touch(key)** (on a `get` hit or a `put` update): remove the key from bucket `f`, add it to bucket `f + 1`. If bucket `f` became empty and `f === minFreq`, bump `minFreq` to `f + 1`.
- **get**: miss → `-1`; hit → `touch`, return value.
- **put** existing key: set the value, `touch`.
- **put** new key: if full, delete the first key of `buckets[minFreq]` from every map. Insert with count `1` into bucket `1` and set `minFreq = 1`.

## Complexity

- `O(1)` average per operation; `O(capacity)` space.

## What interviewers usually want

The textbook version uses a doubly linked list per frequency (with sentinels) instead of a `Set`, and a `key -> node` map. The logic is identical — say which you're using and be ready to explain how a DLL gives `O(1)` removal of an arbitrary node.

## Alternatives to mention

- Scan all keys for the smallest `(count, lastUsed)` on eviction: `O(capacity)` per eviction — the brute force.
- A heap keyed by `(count, lastUsed)` needs `O(log n)` updates and lazy deletion — works, but not `O(1)`.

## Pitfalls

- A `put` that **updates** an existing key must increment its count and must never evict.
- Forgetting to reset `minFreq = 1` after inserting a new key.
- Only bump `minFreq` when the emptied bucket *was* the minimum.
