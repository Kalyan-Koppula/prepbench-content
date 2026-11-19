**Key idea:** walk the list once and turn every `next` pointer around. Keep three references: `prev` (the head of the part already reversed), `current` (the node being flipped) and `next` (saved before the flip, so you don't lose the rest of the list).

## Recognising the pattern

Reversal is the most basic pointer manipulation in the [Linked List](/problems/patterns/linked-list) sheet, and it is a building block for harder problems: Palindrome Linked List, Reorder List and Reverse Nodes in k-Group all reverse part of a list. The only real risk is losing a reference, which is why the order of the three assignments matters.

## Brute force

Copy the values into an array and write them back in reverse order. It is `O(n)` time but `O(n)` extra space, and it changes values rather than links, which most interviewers won't accept.

The reference brute force below is the **recursive** version instead: reverse everything after `head`, then attach `head` at the end of that reversed part. Time `O(n)`, space `O(n)` for the call stack.

## Optimal: iterative pointer reversal

1. `prev = null`, `current = head`.
2. While `current` is not null:
   1. `next = current.next`. Save the rest of the list.
   2. `current.next = prev`. Flip the link.
   3. `prev = current`. The reversed part now starts at `current`.
   4. `current = next`. Move on.
3. Return `prev`, the new head.

The invariant: at the top of the loop, `prev` is the head of the already-reversed prefix, and `current` is the head of the untouched remainder. The two parts are disconnected.

**The recursive version, explained.** `reverseList(head.next)` returns the new head of the reversed tail, and leaves `head.next` (the old second node) as the tail's last node. Setting `head.next.next = head` hangs `head` after it, and `head.next = null` ends the list. Elegant, but it uses `O(n)` stack, which can overflow for very long lists.

## Walkthrough

`1 → 2 → 3 → null`

| step | prev | current | next saved | links after |
| --- | --- | --- | --- | --- |
| start | null | 1 | – | 1→2→3 |
| 1 | 1 | 2 | 2 | null←1, 2→3 |
| 2 | 2 | 3 | 3 | null←1←2, 3 |
| 3 | 3 | null | null | null←1←2←3 |

Return `3`, giving `3 → 2 → 1`.

## Complexity

- Array of values: time `O(n)`, space `O(n)`.
- Recursion: time `O(n)`, space `O(n)` for the call stack.
- Iteration: time `O(n)`, space `O(1)`.

## Edge cases

- Empty list: the loop doesn't run, and `null` is returned.
- One node: its `next` becomes `null` (it already was), and it is returned.
- Two nodes: the smallest case where a link actually flips. Trace it by hand.

## Common mistakes

- Flipping `current.next` before saving it, which loses the rest of the list.
- Returning `head` (now the tail) instead of `prev`.
- In the recursive version, forgetting `head.next = null`, which leaves a cycle between the first two nodes.

## In the interview

- Draw three boxes for `prev`, `current` and `next` and move them on the example. Interviewers value seeing the pointer updates clearly.
- Offer both versions, and mention the stack cost of recursion.
- Likely follow-ups:
  - *Reverse only positions `left..right` (Reverse Linked List II)?* Walk to the node before `left`, reverse `right − left + 1` nodes, and reconnect both ends.
  - *Reverse in groups of `k`?* Reverse each full group and link the groups (Reverse Nodes in k-Group).
