**Key idea:** a singly linked list can't be read backwards, so make its second half readable backwards: find the middle with fast/slow pointers, reverse the second half in place, and compare it node by node with the first half. Reverse it back afterwards so the caller's list is unchanged.

## Recognising the pattern

This combines two basic moves from the [Linked List](/problems/patterns/linked-list) sheet: **find the middle** with fast and slow pointers, and **reverse** a list in place. The `O(1)` space follow-up is what rules out simply copying the values.

## Brute force

Copy the values into an array and compare from both ends inward. That is the reference brute force below. Time `O(n)`, space `O(n)`.

## Optimal: split, reverse, compare, restore

1. **Find the end of the first half.** Move `slow` one step and `fast` two while `fast.next` and `fast.next.next` exist. `slow` stops on the last node of the first half: the first middle for even lengths, the exact middle for odd lengths (which then belongs to the first half and is never compared, which is fine since it matches itself).
2. **Reverse** the list starting at `slow.next`.
3. **Compare** the first half from `head` with the reversed second half. Stop at the end of the second half; it is never longer than the first.
4. **Restore** by reversing the second half again and re-attaching it to `slow.next`.

Restoring isn't required for correctness, but changing an input as a side effect is a bug in real code, and interviewers often ask.

## Walkthrough

`1 → 2 → 2 → 1`

| step | state |
| --- | --- |
| find half | `slow` stops on the first `2` (index 1) |
| reverse | second half `2 → 1` becomes `1 → 2` |
| compare | 1 = 1, 2 = 2 → palindrome |
| restore | second half back to `2 → 1`, attached after index 1 |

For `1 → 2 → 3`, `slow` stops on `2`, the second half is `3`, and `1 ≠ 3` returns `false`.

## Complexity

- Array copy: time `O(n)`, space `O(n)`.
- Split and reverse: time `O(n)`, a few linear passes. Space `O(1)`.

## Edge cases

- One node: trivially a palindrome.
- Two nodes: equal or not, the second half is a single node.
- Odd length: the middle node sits in the first half and isn't compared.

## Common mistakes

- Using the "second middle" loop, which puts the middle node of an even list in the wrong half.
- Comparing until the first half runs out, which in odd lists compares the middle node against nothing.
- Not restoring the list.

## In the interview

- Say the three steps (middle, reverse, compare) before coding, and offer to restore the list.
- Mention the recursive alternative: recurse to the end and compare on the way back with a pointer that moves forward from the head. It is `O(n)` stack, though.
- Likely follow-ups:
  - *Doubly linked list?* Two pointers from both ends, no reversal needed.
  - *Can you avoid modifying the list?* Not in `O(1)` space with a singly linked list; you need the array or recursion.
