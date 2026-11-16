**Key insight:** keep a `Map<key, [timestamp, value][]>`. Because `set` timestamps only grow, each key's list is appended in sorted order for free, and `get` becomes "last entry with time `<= t`" — a binary search.

## Approach

1. `set`: push `[timestamp, value]` onto the key's list (create it if missing). `O(1)`.
2. `get`: if the key is unknown return `""`. Otherwise binary search for the **first** entry with time `> t`; the answer is the entry just before it, or `""` if that index is `0`.

## Complexity

- `set` `O(1)` amortised; `get` `O(log m)` for a key with `m` versions.
- Space `O(n)` over all `set` calls.

## Alternatives to mention

- Linear scan from the end of the list: `O(m)` per `get` — fine for a first pass, too slow with many versions.
- If `set` timestamps could arrive out of order, you'd need a sorted structure (balanced BST / `TreeMap.floorKey` in Java). Ask the interviewer — the increasing guarantee is what makes the array work.

## Pitfalls

- Returning `undefined` for a missing key or a query before the first version; the contract is `""`.
- Off-by-one between "first `> t`" and "last `<= t`". Pick one template and convert explicitly.
