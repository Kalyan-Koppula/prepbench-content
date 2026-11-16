**Key insight:** merge sort is the natural fit for linked lists — splitting at the middle is a fast/slow walk and merging two sorted lists is pure pointer rewiring with no extra array.

## Approach

1. Base case: empty or single node → already sorted.
2. **Split:** fast/slow with `while (fast.next && fast.next.next)` stops `slow` on the **first** middle. `right = slow.next; slow.next = null`.
3. **Recurse** on both halves.
4. **Merge** them with a dummy node (exactly Merge Two Sorted Lists).

## Complexity

- Time `O(n log n)` — `log n` levels, `O(n)` merging per level.
- Space `O(log n)` recursion stack.

## Follow-up: `O(1)` space

Bottom-up merge sort: merge runs of size 1, then 2, 4, … across the whole list. Each pass walks the list, cuts off two runs of the current size, merges them and appends to a tail. No recursion, `O(1)` extra space — more code, and interviewers mostly want you to describe it.

## Alternatives to mention

- Copy values to an array, sort, write back: `O(n)` extra space — fine as a baseline.
- Quick sort on lists works but degrades to `O(n²)` on sorted input or many duplicates.

## Pitfalls

- Splitting on the **second** middle (`while (fast && fast.next)`) never shrinks a two-node list — infinite recursion.
- Forgetting `slow.next = null`, so the left half still contains the right half.
