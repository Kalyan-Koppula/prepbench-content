**Key insight:** only the `k` largest values matter. Keep them in a min-heap of size `k`; the smallest of those — the heap's top — is the k-th largest overall.

## Approach

1. In the constructor, feed every initial number through `add` (ignoring its return value).
2. `add(val)`: push `val`; if the heap now holds more than `k` items, pop the minimum — it can never be the k-th largest again, because the stream only grows.
3. Return `heap.peek()`.

## Complexity

- `add`: `O(log k)`. Constructor: `O(n log k)`.
- Space `O(k)`.

## Alternatives to mention

- Sort on every `add`: `O(n log n)` per call.
- Keep a sorted array and binary-search the insert position: `O(log n)` to find, but `O(n)` to shift.
- If the interviewer asks you to implement the heap yourself, a size-`k` array with sift-up/sift-down is enough.

## Pitfalls

- Using a *max*-heap of everything works but costs `O(n)` space and makes "k-th largest" an `O(k log n)` query.
- The heap may hold fewer than `k` values initially (`nums` shorter than `k`); the guarantee only applies once `add` returns.
