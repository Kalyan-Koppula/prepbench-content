**Key insight:** the result is the first half interleaved with the **reversed** second half. That's three standard moves: middle, reverse, merge.

## Approach

1. **Split.** Fast/slow with `while (fast.next && fast.next.next)` leaves `slow` on the last node of the first half (the first half gets the extra node for odd lengths). Detach: `second = slow.next; slow.next = null`.
2. **Reverse** `second` in place.
3. **Interleave.** While `second` is non-empty: save both `next`s, link `first -> second -> first.next`, advance both.

## Complexity

- Time `O(n)` — three linear passes.
- Space `O(1)`.

## Alternatives to mention

- Put the nodes in an array, then relink with two indices from both ends: `O(n)` extra space, very easy to get right.
- A stack of the second half's nodes: same `O(n)` space.

## Pitfalls

- Forgetting `slow.next = null` — the first half still points into the (now reversed) second half and you build a cycle.
- Interleaving loop condition: the second half is never longer than the first, so loop on `second`.
- Returning a new head: the head never changes here, and the function returns nothing.
