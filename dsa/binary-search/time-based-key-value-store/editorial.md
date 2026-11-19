**Key idea:** keep, for each key, the list of `(timestamp, value)` pairs in the order they were set. Timestamps arrive in increasing order, so each list is already sorted, and `get` is a binary search for the last timestamp that is `<= t`.

## Recognising the pattern

"The latest entry at or before time `t`" in a sorted list is a **boundary search**: find the first timestamp greater than `t`, then step back one. That is the lower/upper-bound variant from the [Binary Search](/problems/patterns/binary-search) sheet, wrapped in a hash map from key to list.

## Brute force

Store every `set` in one log. For `get`, scan the whole log for entries with the right key and a timestamp `<= t`, keeping the latest. That is the reference brute force below.

`set` is `O(1)`, `get` is `O(total sets)`. With `2 · 10^5` calls that can reach `10^10` steps.

## Better: per-key lists, linear scan

Group entries by key in a map, so `get` scans only that key's list from the end backwards and stops at the first timestamp `<= t`. Faster in practice, still `O(entries for that key)` in the worst case.

## Optimal: per-key sorted lists with binary search

1. A map from key to two parallel arrays, `times` and `values`.
2. `set(key, value, t)`: append `t` and `value` to that key's arrays. Since timestamps strictly increase, `times` stays sorted.
3. `get(key, t)`:
   1. If the key is missing, return `""`.
   2. Binary search for the first index `lo` with `times[lo] > t`, using `lo = 0`, `hi = length`, moving `lo = mid + 1` when `times[mid] <= t` and `hi = mid` otherwise.
   3. If `lo == 0`, every entry is later than `t`: return `""`. Otherwise return `values[lo − 1]`.

**The half-open search.** With `hi = length` (one past the end), the loop finds the insertion point for `t`, which can be `length` when every timestamp is `<= t`. Stepping back one gives the answer in all cases without special handling.

## Walkthrough

Calls: `set("foo", "bar", 1)`, `get("foo", 1)`, `get("foo", 3)`, `set("foo", "bar2", 4)`, `get("foo", 4)`, `get("foo", 5)`.

| call | times for "foo" | search for first time > t | result |
| --- | --- | --- | --- |
| get(foo, 1) | [1] | index 1 | values[0] = "bar" |
| get(foo, 3) | [1] | index 1 | "bar" |
| get(foo, 4) | [1, 4] | index 2 | values[1] = "bar2" |
| get(foo, 5) | [1, 4] | index 2 | "bar2" |

A call like `get("foo", 0)` would find index 0 and return `""`.

## Complexity

- Global log: `set` `O(1)`, `get` `O(N)` for `N` total sets. Space `O(N)`.
- Per-key lists with binary search: `set` `O(1)` amortised, `get` `O(log k)` for the `k` entries of that key. Space `O(N)`.

## Edge cases

- `get` on a key that was never set: `""`.
- `get` with a time before the key's first set: `""`.
- `get` with a time after the last set: the latest value.
- Many keys interleaved: each key's list is still sorted, because the global timestamps increase.

## Common mistakes

- Searching for the first timestamp `>= t` and returning the entry before it, which misses an exact match.
- Returning `values[lo]` instead of `values[lo − 1]`.
- Sorting the list on every `set`, when the input already guarantees order.

## In the interview

- Ask whether timestamps are guaranteed to increase. If not, insert into the right position (or use a balanced tree) instead of appending.
- Likely follow-ups:
  - *Out-of-order timestamps?* Use a sorted structure per key (a tree map's `floorEntry` in Java) for `O(log k)` inserts and lookups.
  - *Range query (all values between two times)?* Two boundary searches give the slice.
  - *Memory limits with old versions?* Compact or expire old entries per key.
