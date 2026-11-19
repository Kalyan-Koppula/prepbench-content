**Key idea:** merge sort is the natural sort for linked lists. Split the list at its middle with fast and slow pointers, sort each half recursively, and merge the two sorted halves by relinking nodes. Splitting and merging need no random access, which is exactly what lists lack.

## Recognising the pattern

`O(n log n)` on a list rules out quicksort's random pivots and heapsort's indexing; merge sort only ever walks forward. It combines two moves from the [Linked List](/problems/patterns/linked-list) sheet, **find the middle** and **merge two sorted lists**, with recursion.

## Brute force

Insertion sort on the list: take each node and insert it into a growing sorted list by walking from the front to the right spot. That is the reference brute force below.

Correct and in place, but `O(n²)` time in the worst case. Space `O(1)`. (Copying the values to an array, sorting and rebuilding is `O(n log n)` but uses `O(n)` space and doesn't relink nodes.)

## Optimal: top-down merge sort

1. If the list has 0 or 1 nodes, it is sorted: return it.
2. **Split.** Advance `slow` one step and `fast` two steps while `fast.next` and `fast.next.next` exist. `slow` stops at the end of the first half. Set `right = slow.next` and cut with `slow.next = null`.
3. **Recurse** on both halves.
4. **Merge** the two sorted halves with a dummy head and a tail pointer, taking the smaller front node each time.

**Why the first middle?** With the second-middle loop, a two-node list would split into 2 + 0 and recurse forever. Stopping at the first middle always produces two non-empty halves.

**The `O(1)` space follow-up.** The recursion uses `O(log n)` stack. Bottom-up merge sort avoids it: merge runs of length 1, then 2, then 4, and so on, walking the list each round and splicing merged runs together. Same `O(n log n)` time, constant extra space, but more pointer bookkeeping.

## Walkthrough

`4 → 2 → 1 → 3`

| level | lists |
| --- | --- |
| split | `4 → 2` and `1 → 3` |
| split again | `4`, `2`, `1`, `3` |
| merge pairs | `2 → 4` and `1 → 3` |
| merge | `1 → 2 → 3 → 4` |

## Complexity

- Insertion sort: time `O(n²)`, space `O(1)`.
- Top-down merge sort: time `O(n log n)`, `log n` levels of linear merging. Space `O(log n)` for the recursion.
- Bottom-up merge sort: time `O(n log n)`, space `O(1)`.

## Edge cases

- Empty list or one node: returned unchanged.
- Already sorted or reverse sorted: same `O(n log n)`; merge sort doesn't degrade.
- Many equal values: `<=` in the merge keeps it stable.

## Common mistakes

- Not cutting the list after the first half, so the "halves" overlap.
- Using the second-middle split, which recurses forever on two nodes.
- Forgetting to attach the leftover half after the merge loop.

## In the interview

- Explain why merge sort suits lists (no random access needed), then reuse your merge from Merge Two Sorted Lists.
- Mention bottom-up merge sort for the constant-space follow-up, even if you don't code it.
- Likely follow-ups:
  - *Quicksort on a list?* Possible with partitioning into three lists (less, equal, greater), but the worst case is `O(n²)`.
  - *Sort `k` sorted lists?* Merge with a heap (Merge k Sorted Lists).
