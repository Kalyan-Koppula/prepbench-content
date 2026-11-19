**Key idea:** combine a hash map for `O(1)` lookup with a doubly linked list ordered by recency. The map stores each key's node. Every access moves that node to the "most recent" end; eviction removes the node at the "least recent" end. Both are `O(1)` because a doubly linked node can be unlinked without searching.

## Recognising the pattern

A design problem with two `O(1)` requirements that no single structure meets: a map finds keys but has no order, a list keeps order but can't find keys. The standard answer, used throughout the [Linked List](/problems/patterns/linked-list) sheet's design problems, is to keep **both** and point from one into the other.

## Brute force

Keep the keys in an array ordered from least to most recently used, with the values alongside. `get` and `put` search the array, then move the entry to the end; eviction removes index 0. That is the reference brute force below.

Correct, but each operation is `O(capacity)`. With `2 · 10^5` calls and capacity 3000, that is around `6 · 10^8` steps.

## Optimal: hash map plus doubly linked list

Structure:

- A doubly linked list with two sentinel nodes, `head` and `tail`. `head.next` is the least recently used node; `tail.prev` is the most recently used. Sentinels mean every real node always has a `prev` and a `next`, so there are no null checks.
- A map from key to node.

Helpers:

- `unlink(node)`: connect `node.prev` and `node.next` to each other.
- `addToEnd(node)`: insert `node` just before `tail`.

Operations:

1. `get(key)`: look up the node. If absent, return −1. Otherwise unlink it, add it to the end, and return its value.
2. `put(key, value)`:
   - If the key exists, update the value and move the node to the end.
   - Otherwise create a node, store it in the map, and add it to the end. If the map now holds more than `capacity` entries, unlink `head.next` and delete its key from the map.

**Why the node stores its key.** On eviction you have the node, not the key, and you need the key to remove the map entry.

**About the JavaScript shortcut.** A JavaScript `Map` remembers insertion order, so deleting and re-inserting a key also works as an LRU. That relies on a language-specific detail and isn't what interviewers are testing. The explicit list works in any language.

## Walkthrough

Capacity 2.

| call | list (LRU → MRU) | returns |
| --- | --- | --- |
| put(1, 1) | 1 | |
| put(2, 2) | 1, 2 | |
| get(1) | 2, 1 | 1 |
| put(3, 3) | 1, 3 (evicts 2) | |
| get(2) | 1, 3 | −1 |
| put(4, 4) | 3, 4 (evicts 1) | |
| get(1) | 3, 4 | −1 |
| get(3) | 4, 3 | 3 |
| get(4) | 3, 4 | 4 |

## Complexity

- Array: `O(capacity)` per operation, space `O(capacity)`.
- Map plus doubly linked list: `O(1)` average per operation, space `O(capacity)`.

## Edge cases

- Capacity 1: every new key evicts the previous one.
- `put` on an existing key: update and refresh, never evict.
- `get` on a missing key: −1, with no change to the order.

## Common mistakes

- A singly linked list, which can't unlink a node in `O(1)`.
- Forgetting to delete the evicted key from the map.
- Evicting before inserting, and so evicting when the key already existed.
- Not moving a node on `get`.

## In the interview

- Explain why one structure isn't enough, then draw the map arrows pointing into the list.
- Write `unlink` and `addToEnd` first; the operations are then a few lines each.
- Likely follow-ups:
  - *Least frequently used instead?* Group nodes by frequency, each group an LRU list (LFU Cache).
  - *Thread safety?* A lock around each operation, or sharded caches.
  - *Time-based expiry?* Store a timestamp per node and evict expired entries lazily on access.
