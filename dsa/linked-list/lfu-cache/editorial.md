**Key idea:** group keys by their use count. Each group is an LRU list (a doubly linked list ordered by recency), and you remember the smallest count currently in use. Eviction removes the oldest node of the smallest-count list. A use moves a node from its count's list to the next count's list. Everything is `O(1)`.

## Recognising the pattern

LFU is LRU with an extra dimension. LRU Cache pairs a hash map with one doubly linked list. Here you need recency **within each frequency**, so you keep one list per frequency, a second map from frequency to list, and a `minCount` pointer, a design built from the [Linked List](/problems/patterns/linked-list) sheet's pieces.

## Brute force

Store, per key, its value, use count and last-use time (a global clock). `get` and updates are `O(1)`. Eviction scans every key for the lowest count, breaking ties by the oldest last-use time. That is the reference brute force below.

Correct, but eviction is `O(capacity)`.

## Optimal: frequency lists plus a minimum pointer

State:

- `nodes`: key → node holding `key`, `value` and `count`.
- `lists`: count → a doubly linked list of nodes with that count, oldest first.
- `minCount`: the smallest count that currently has nodes.

Operations:

1. **touch(node)** (on every use): remove the node from `lists[count]`. If that list is now empty and `count` was `minCount`, increase `minCount` by one, because the node is about to have `count + 1`. Increment `count` and append the node to `lists[count]`.
2. **get(key)**: if missing, return −1. Otherwise touch the node and return its value.
3. **put(key, value)**:
   - Existing key: update the value and touch the node.
   - New key: if the cache is full, evict the oldest node of `lists[minCount]` and delete its key. Then create the node with count 1, append it to `lists[1]`, and set `minCount = 1`.

**Why `minCount` can be maintained in `O(1)`.** It only changes in two ways: a new key resets it to 1, and a touch may raise it by exactly one when it empties the minimum list. It never needs a search.

## Walkthrough

Capacity 2.

| call | counts after | lists | minCount | returns |
| --- | --- | --- | --- | --- |
| put(1, 1) | 1:1 | 1 → [1] | 1 | |
| put(2, 2) | 1:1, 2:1 | 1 → [1, 2] | 1 | |
| get(1) | 1:2, 2:1 | 1 → [2], 2 → [1] | 1 | 1 |
| put(3, 3) | evict 2; 1:2, 3:1 | 1 → [3], 2 → [1] | 1 | |
| get(2) | | | | −1 |
| get(3) | 1:2, 3:2 | 2 → [1, 3] | 2 | 3 |
| put(4, 4) | evict 1 (oldest with count 2); 3:2, 4:1 | 1 → [4], 2 → [3] | 1 | |

## Complexity

- Brute force: `O(1)` for `get`, `O(capacity)` for `put` with eviction. Space `O(capacity)`.
- Frequency lists: `O(1)` average for both. Space `O(capacity)`.

## Edge cases

- Ties in frequency: the oldest node in that list is evicted (LRU among equals).
- Updating an existing key with `put` counts as a use.
- Capacity 1: every new key evicts the only key.

## Common mistakes

- Evicting from the wrong list because `minCount` wasn't updated after a touch.
- Forgetting to reset `minCount` to 1 when a new key is inserted.
- Relying on JavaScript `Set` or `Map` insertion order as the recency list. It works in JavaScript, but hides the design the question is about.

## In the interview

- Build from LRU: "the same structure, but one list per frequency, plus the minimum frequency."
- Walk through how `minCount` changes; it is the subtle part.
- Likely follow-ups:
  - *Decay old counts?* Periodically halve all counts (as in some production caches), or count only recent windows.
  - *Which is better in practice?* LRU adapts quickly to changing access patterns; LFU protects popular items from scans. Many real systems blend the two.
