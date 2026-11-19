**Key idea:** the new order takes nodes alternately from the front and the back. A singly linked list can't be walked backwards, so cut it in half, reverse the second half, and then weave the two halves together: first, last, second, second-to-last, and so on.

## Recognising the pattern

Three standard moves from the [Linked List](/problems/patterns/linked-list) sheet chained together: **find the middle** (fast and slow pointers), **reverse** a list, and **merge** two lists by alternating nodes. Each is linear and constant-space, so the whole thing is too.

## Brute force

Put all the nodes in an array, then relink them with two indices moving inward: `nodes[i] → nodes[j] → nodes[i+1] → nodes[j−1] …`, and end the list at the middle node. That is the reference brute force below.

Correct because the array gives random access to the back of the list. Time `O(n)`, space `O(n)`.

## Optimal: split, reverse, weave

1. **Split.** With `slow` and `fast` starting at `head`, advance while `fast.next` and `fast.next.next` exist. `slow` ends on the last node of the first half. Set `second = slow.next` and cut with `slow.next = null`. The first half is the same length as the second, or one longer.
2. **Reverse** the second half, so its first node is the original last node.
3. **Weave.** With `first = head` and `second` = reversed head, repeatedly:
   - save `first.next` and `second.next`,
   - link `first → second → (saved first.next)`,
   - advance both to their saved nexts,

   until `second` runs out.

Saving both `next` pointers before relinking is the whole difficulty: once you change `first.next`, the rest of the first half is reachable only through the saved reference.

## Walkthrough

`1 → 2 → 3 → 4 → 5`

| step | result |
| --- | --- |
| split | first `1 → 2 → 3`, second `4 → 5` |
| reverse | second `5 → 4` |
| weave 1 | `1 → 5 → 2 …` |
| weave 2 | `1 → 5 → 2 → 4 → 3` |

The first half's extra node (`3`) is already last, and its `next` is `null` from the cut.

## Complexity

- Array: time `O(n)`, space `O(n)`.
- Split, reverse, weave: time `O(n)`, three linear passes. Space `O(1)`.

## Edge cases

- One or two nodes: nothing changes. The function returns early, or the weave produces the same order.
- Even length, like `1 → 2 → 3 → 4`: halves `1 → 2` and `4 → 3`, giving `1 → 4 → 2 → 3`.

## Common mistakes

- Forgetting to cut the list after the first half, which creates a cycle.
- Using the "second middle" split, which makes the second half longer and leaves a node unwoven.
- Relinking before saving the next pointers.

## In the interview

- Name the three sub-steps before coding, and write each as a small, separate block.
- Likely follow-ups:
  - *Return a new list without modifying the input?* Copy values or nodes into an array and build from both ends.
  - *Other interleavings (odd positions then even)?* Two tails, one for each group, then join them (Odd Even Linked List).
