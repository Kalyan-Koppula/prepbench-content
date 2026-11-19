**Key idea:** repeatedly take the smaller of the two front nodes and append it to the result. A dummy node in front of the result removes the special case of the empty result, and when one list runs out, the other is attached as a whole.

## Recognising the pattern

This is the merge step of merge sort, done with pointers instead of array indices. Building a result list with a **dummy head** and a `tail` pointer is a core technique in the [Linked List](/problems/patterns/linked-list) sheet, used again in Add Two Numbers, Merge k Sorted Lists and Sort List.

## Brute force

Collect every value from both lists into an array, sort it, and build a new list. That is the reference brute force below.

Correct, but it ignores that both inputs are sorted and allocates new nodes, which the statement asks you not to do. Time `O((m + n) log(m + n))`, space `O(m + n)`.

## Optimal: splice with a dummy head

1. Create `dummy` and set `tail = dummy`.
2. While both lists have nodes:
   1. If `a.val <= b.val`, attach `a` (`tail.next = a`) and advance `a`. Otherwise attach `b` and advance `b`.
   2. Move `tail` to the node just attached.
3. Attach whichever list is non-empty (or `null`) to `tail.next`.
4. Return `dummy.next`.

**Why a dummy?** Without it, the first node of the result needs special handling ("is the result empty yet?"). With it, every node, including the first, is attached the same way.

**Why `<=`?** On equal values, taking from `list1` first keeps the merge stable. It doesn't matter for numbers, but it does when nodes carry other data.

## Walkthrough

`list1 = 1 → 2 → 4`, `list2 = 1 → 3 → 4`

| a | b | take | result so far |
| --- | --- | --- | --- |
| 1 | 1 | a (1 ≤ 1) | 1 |
| 2 | 1 | b | 1, 1 |
| 2 | 3 | a | 1, 1, 2 |
| 4 | 3 | b | 1, 1, 2, 3 |
| 4 | 4 | a | 1, 1, 2, 3, 4 |
| null | 4 | attach rest of b | 1, 1, 2, 3, 4, 4 |

## Complexity

- Sort the values: time `O((m + n) log(m + n))`, space `O(m + n)`.
- Splice: time `O(m + n)`, each node is attached once. Space `O(1)`, only pointers.

## Edge cases

- One or both lists empty: the loop doesn't run and the other list (or `null`) is attached.
- One list much longer: it is attached in one step at the end.
- All values equal: alternates between the lists while both have nodes.

## Common mistakes

- Forgetting to move `tail` after attaching a node.
- Forgetting to attach the leftover list at the end.
- Returning `dummy` instead of `dummy.next`.

## In the interview

- Mention the dummy node before you start; it shows you know the idiom.
- Offer the recursive version as an alternative: return the smaller head with its `next` set to the merge of the rest. It is shorter, but uses `O(m + n)` stack.
- Likely follow-ups:
  - *Merge `k` sorted lists?* Use a min-heap of the current heads, or merge pairs in rounds (Merge k Sorted Lists).
  - *Sort a linked list?* Split at the middle, sort both halves, merge them (Sort List).
