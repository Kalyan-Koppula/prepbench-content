**Key insight:** combine a hash map (O(1) lookup) with an ordering structure that supports O(1) "move to front" and "drop the oldest" — a doubly linked list, or in JS, a `Map`'s insertion order.

## Approach (JS `Map`)

- `get`: if present, delete and re-insert so the key becomes newest.
- `put`: delete (if present), insert, and if over capacity delete `map.keys().next().value` — the oldest key.

## Approach (what interviewers usually want)

A `Map<key, node>` plus a doubly linked list with sentinel `head`/`tail` nodes. Most recent sits next to `head`; evict `tail.prev`. Each operation is a constant number of pointer updates.

Say which one you're writing. Many interviewers accept the `Map` version but then ask you to explain or code the linked-list version — be ready for both.

## Complexity

- `O(1)` average per operation, `O(capacity)` space.
