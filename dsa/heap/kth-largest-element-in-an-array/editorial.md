**Key insight:** you only need to remember the `k` largest values seen so far. A min-heap capped at size `k` keeps exactly those, with the smallest of them — the k-th largest — on top.

## Approach

1. Push each number into a min-heap.
2. Whenever the heap grows past `k`, pop its minimum.
3. After the scan, `peek()` is the answer.

## Complexity

- Time `O(n log k)`.
- Space `O(k)`.

## Alternatives to mention

- **Sort** descending and index `k - 1`: `O(n log n)`. Say it first as the baseline.
- **Quickselect**: partition around a pivot; the k-th largest is at index `n - k` in ascending order, so recurse only into the side containing that index. `O(n)` average, `O(n²)` worst case — pick a random pivot to make the worst case unlikely. With many duplicates, use three-way partitioning (`<`, `=`, `>`) or it degrades.
- **Counting sort** when values are bounded (here `-10^4..10^4`): `O(n + range)`.

## Pitfalls

- The heap must be a **min**-heap; a max-heap of size `k` keeps the wrong end.
- Off-by-one with quickselect: "k-th largest" is index `n - k` in ascending order, not `k`.
