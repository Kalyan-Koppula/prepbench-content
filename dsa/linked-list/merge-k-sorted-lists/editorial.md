**Key insight:** at every step the next output node is the minimum among the `k` current heads. A min-heap of heads gives that minimum in `O(log k)`, so the whole merge is `O(N log k)`.

## Approach (heap)

1. Push every non-null head into a min-heap ordered by `val`.
2. Pop the smallest node, append it to the result tail, and push its `next` if there is one.
3. Repeat until the heap is empty; return `dummy.next`.

`PriorityQueue` is provided here; in an interview you may be asked to code the heap yourself, or to explain sift-up / sift-down.

## Approach (divide and conquer)

Merge lists pairwise: `0+1`, `2+3`, … then merge the results, and so on. `log k` rounds, each touching all `N` nodes → `O(N log k)` time with `O(1)` extra space (iteratively). Good answer when no heap is available.

## Complexity

- Time `O(N log k)` — each of `N` nodes is pushed and popped once.
- Space `O(k)` for the heap.

## Alternatives to mention

- Merge one list at a time into an accumulator: `O(N · k)` — the accumulator is re-walked every time.
- Collect all values and sort: `O(N log N)` and allocates new nodes.

## Pitfalls

- Pushing `null` heads (empty lists) into the heap.
- Empty input `[]` and `[[]]` should both return an empty list.
