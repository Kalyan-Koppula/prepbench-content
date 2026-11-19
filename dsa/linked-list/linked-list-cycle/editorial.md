**Key idea:** send two pointers through the list, `slow` one step at a time and `fast` two. Without a cycle, `fast` falls off the end. With a cycle, both end up going round it, and `fast` closes the gap by one node per step, so it must land exactly on `slow`.

## Recognising the pattern

"Does following `next` ever repeat?" can be answered by remembering every node, but the `O(1)` follow-up asks for Floyd's **fast/slow pointer** technique from the [Linked List](/problems/patterns/linked-list) sheet. The same two pointers find the middle of a list and, with one extra step, where a cycle begins.

## Brute force

Walk the list and store every node in a hash set. If you reach a node that is already in the set, there is a cycle; if you reach `null`, there isn't. That is the reference brute force below.

Correct because a cycle means some node is visited twice. Time `O(n)`, space `O(n)`. Note that it stores **nodes**, not values: two different nodes may hold the same value.

## Optimal: Floyd's cycle detection

1. `slow = head`, `fast = head`.
2. While `fast` and `fast.next` are not null:
   1. `slow = slow.next`, `fast = fast.next.next`.
   2. If `slow === fast`, return `true`.
3. Return `false`.

**Why they must meet.** Once both pointers are inside a cycle of length `L`, measure the distance from `slow` forward to `fast` around the cycle. Each step, `slow` moves one node and `fast` moves two, so that distance shrinks by exactly one. It can't jump past zero, so after at most `L` steps it is zero: they meet. Before `slow` enters the cycle, `fast` is already inside it, so the whole run takes at most about `n` steps.

## Walkthrough

Values `[3, 2, 0, -4]` with the last node pointing back to index 1 (the `2`). Write nodes by index: `0 → 1 → 2 → 3 → 1 → …`

| step | slow | fast |
| --- | --- | --- |
| start | 0 | 0 |
| 1 | 1 | 2 |
| 2 | 2 | 1 (3 → back to 1) |
| 3 | 3 | 3 |

They meet at node 3, so return `true`.

## Complexity

- Hash set: time `O(n)`, space `O(n)`.
- Floyd: time `O(n)`, space `O(1)`.

## Edge cases

- Empty list or a single node without a cycle: `fast` or `fast.next` is null immediately.
- A single node pointing to itself: after one step both pointers are on it.
- A cycle that covers the whole list: still detected within about `n` steps.

## Common mistakes

- Comparing values instead of node identity.
- Checking `slow === fast` before moving them; they start equal at the head.
- Reading `fast.next.next` without checking `fast.next`.

## In the interview

- Mention the hash-set solution first, then Floyd for `O(1)` space with the "gap closes by one" argument.
- Likely follow-ups:
  - *Where does the cycle start (Linked List Cycle II)?* After they meet, move one pointer back to `head` and step both one node at a time; they meet at the start of the cycle.
  - *Length of the cycle?* After meeting, keep one pointer still and count steps until the other returns.
  - *Duplicate in an array of `1..n` (Find the Duplicate Number)?* Treat `i → nums[i]` as a linked list and run the same algorithm.
