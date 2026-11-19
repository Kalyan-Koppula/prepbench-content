**Key idea:** the next node of the result is always the smallest of the `k` current list heads. A min-heap keyed on node value gives that smallest head in `O(log k)`. Pop it, append it, and push its successor. Every node passes through the heap once.

## Recognising the pattern

Merging two sorted lists is a [Linked List](/problems/patterns/linked-list) basic. With `k` lists, finding the smallest front among `k` candidates on every step is the job of a **heap**: the standard "k-way merge". The alternative is to merge lists in pairs, like the levels of merge sort.

## Brute force

Merge the lists into the result one at a time: result = merge(result, list 1), then merge(result, list 2), and so on. That is the reference brute force below.

Correct, but the result grows each time, so early nodes are walked again and again: `O(k · N)` for `N` total nodes. Space `O(1)`.

(Collecting every value, sorting, and rebuilding is `O(N log N)` with `O(N)` space and doesn't reuse nodes.)

## Optimal: min-heap of list heads

1. Push the head of every non-empty list into a min-heap ordered by `val`.
2. While the heap is not empty:
   1. Pop the smallest node and append it to the result (`tail.next = node`, `tail = node`).
   2. If `node.next` exists, push it.
3. Set `tail.next = null` and return `dummy.next`.

The heap never holds more than `k` nodes, one per list, so each push and pop costs `O(log k)`.

**Alternative: divide and conquer.** Merge lists in pairs (0 with 1, 2 with 3, …), then merge the results in pairs, until one list is left. There are `log k` rounds, each touching all `N` nodes: also `O(N log k)`, and it needs no heap.

## Walkthrough

`lists = [1 → 4 → 5, 1 → 3 → 4, 2 → 6]`

| heap (values) | pop | push | result so far |
| --- | --- | --- | --- |
| 1, 1, 2 | 1 (list 1) | 4 | 1 |
| 1, 2, 4 | 1 (list 2) | 3 | 1, 1 |
| 2, 3, 4 | 2 | 6 | 1, 1, 2 |
| 3, 4, 6 | 3 | 4 | 1, 1, 2, 3 |
| 4, 4, 6 | 4 | 5 | 1, 1, 2, 3, 4 |
| 4, 5, 6 | 4 | – | …, 4 |
| 5, 6 | 5 | – | …, 5 |
| 6 | 6 | – | 1, 1, 2, 3, 4, 4, 5, 6 |

## Complexity

- One at a time: time `O(k · N)`, space `O(1)`.
- Sort all values: time `O(N log N)`, space `O(N)`.
- Min-heap: time `O(N log k)`, space `O(k)` for the heap.
- Pairwise merging: time `O(N log k)`, space `O(1)` iteratively (or `O(log k)` recursively).

## Edge cases

- `k = 0` or all lists empty: return `null`.
- One list: returned as is.
- Lists of very different lengths: the heap simply holds fewer entries as lists run out.

## Common mistakes

- Pushing `null` heads into the heap.
- Pushing every node at the start, which makes the heap size `N` instead of `k`.
- Forgetting that JavaScript has no built-in heap; say what you'd use, or write a small one.

## In the interview

- Start from "merge two" and explain why merging one at a time is `O(k · N)`.
- Present the heap and mention pairwise merging as a heap-free alternative with the same complexity.
- Likely follow-ups:
  - *External sorting of huge files?* The same k-way merge over sorted chunks on disk.
  - *Smallest range covering one element from each list?* Keep the `k` fronts in a heap and track their maximum.
