**Key idea:** move a `fast` pointer two steps for every one step of a `slow` pointer. When `fast` reaches the end, `slow` has gone exactly half as far: it is at the middle.

## Recognising the pattern

You don't know the length, and a list can't be indexed. "Find a position relative to the length in one pass" is the fast/slow pointer technique from the [Linked List](/problems/patterns/linked-list) sheet. The same two pointers detect cycles and split lists in half for merge sort.

## Brute force

Count the nodes in one pass, then walk `floor(count / 2)` steps from the head in a second pass. That is the reference brute force below.

Correct and `O(n)` time, `O(1)` space, but it reads the list twice. (Storing all nodes in an array and indexing the middle is one pass but `O(n)` space.)

## Optimal: fast and slow pointers

1. `slow = head`, `fast = head`.
2. While `fast` and `fast.next` are not null:
   1. `slow = slow.next`.
   2. `fast = fast.next.next`.
3. Return `slow`.

After `k` iterations, `slow` is at index `k` and `fast` at index `2k`. The loop stops when `fast` is at the last node (odd length) or just past it (even length). For a list of length `n`, that happens after `floor(n / 2)` steps, so `slow` ends at index `floor(n / 2)`, which is the second middle for even lengths, as required.

**Which middle?** The loop condition decides it. To get the **first** middle for even lengths, which you need when splitting a list into halves, stop one step earlier: loop while `fast.next` and `fast.next.next` are not null.

## Walkthrough

`1 → 2 → 3 → 4 → 5 → 6`

| step | slow | fast |
| --- | --- | --- |
| start | 1 | 1 |
| 1 | 2 | 3 |
| 2 | 3 | 5 |
| 3 | 4 | null (past 6) |

`fast` is null, so return `slow = 4`, the second of the two middles (3 and 4). For `1 → 2 → 3 → 4 → 5`, `fast` stops on 5 after two steps and `slow` is on 3.

## Complexity

- Count then walk: time `O(n)`, space `O(1)`, two passes.
- Array of nodes: time `O(n)`, space `O(n)`.
- Fast and slow: time `O(n)`, one pass. Space `O(1)`.

## Edge cases

- One node: the loop doesn't run, and that node is the middle.
- Two nodes: one step, returning the second node.

## Common mistakes

- Checking only `fast !== null` and then reading `fast.next.next` when `fast.next` is null.
- Returning the first middle when the problem wants the second, or the other way round.

## In the interview

- Explain the 2:1 speed argument and how the loop condition picks the first or second middle.
- Likely follow-ups:
  - *Detect a cycle?* The same pointers: if `fast` ever meets `slow`, there is a cycle (Linked List Cycle).
  - *Delete the middle node?* Track the node before `slow` and unlink `slow`.
  - *Split for merge sort?* Use the first-middle condition, then cut after `slow`.
