**Key idea:** put a `fast` pointer `n` nodes ahead of a `slow` pointer, then move both together. When `fast` reaches the last node, `slow` is right before the node to delete. A dummy node before the head makes deleting the head itself work the same way.

## Recognising the pattern

"The `n`-th from the end" without knowing the length is a **gap** problem: two pointers a fixed distance apart, from the [Linked List](/problems/patterns/linked-list) sheet. Deletion needs the node **before** the target, which is why the dummy node matters.

## Brute force

Two passes: count the length `L`, then walk to the node at position `L − n` (the one before the target) and unlink the next node. That is the reference brute force below.

Correct and `O(L)` time, `O(1)` space. It just reads the list twice.

## Optimal: one pass with a gap of `n`

1. `dummy.next = head`; `fast = slow = dummy`.
2. Move `fast` forward `n` times.
3. While `fast.next` is not null, move both `fast` and `slow` one step.
4. Now `slow.next` is the target: `slow.next = slow.next.next`.
5. Return `dummy.next`.

**Why it lands right.** After step 2, `fast` is `n` nodes ahead of `slow`. When `fast` is on the last node, `slow` is `n` nodes before it, which is exactly the node before the `n`-th from the end.

**Why the dummy.** If `n` equals the length, the target is the head, and the node before it doesn't exist. The dummy provides it, and `dummy.next` then correctly becomes the new head.

## Walkthrough

`1 → 2 → 3 → 4 → 5`, `n = 2` (delete `4`)

| step | slow | fast |
| --- | --- | --- |
| start | dummy | dummy |
| after moving fast 2 | dummy | 2 |
| move together | 1 | 3 |
| | 2 | 4 |
| | 3 | 5 (last node, stop) |

`slow` is on `3`, so `3.next` becomes `5`. Result `1 → 2 → 3 → 5`.

## Complexity

- Two passes: time `O(L)`, space `O(1)`.
- One pass with a gap: time `O(L)`, space `O(1)`.

## Edge cases

- Removing the head (`n` = length): `slow` stays on `dummy`, and `dummy.next` becomes the second node.
- A single node with `n = 1`: the result is the empty list.
- Removing the last node (`n = 1`): `slow` ends on the second-to-last node.

## Common mistakes

- Not using a dummy, then crashing or returning the wrong head when the head is removed.
- Off-by-one in the gap: moving `fast` `n + 1` times from `head` instead of `n` times from `dummy` (both work if done consistently, mixing them doesn't).
- Returning `head` instead of `dummy.next`, which still points at the removed head.

## In the interview

- Mention the two-pass version, then the one-pass gap for the follow-up.
- Draw the gap on the example; it makes the off-by-one obvious.
- Likely follow-ups:
  - *Return the `n`-th node from the end without deleting?* Stop with `slow` one node later (start both at `head`).
  - *Rotate the list by `k`?* Find the new tail with the same gap idea, then re-link (Rotate List).
