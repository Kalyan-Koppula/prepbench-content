**Key insight:** walking forward, flip each `next` pointer to the node behind you. Save the original `next` first or you lose the rest of the list.

## Approach

Keep `prev` (already reversed part) and `cur` (next node to flip). Each step: save `next`, point `cur.next` at `prev`, advance both. When `cur` is `null`, `prev` is the new head.

## Complexity

- Time `O(n)`, space `O(1)`.
- The recursive version (`reverse(head.next)` then `head.next.next = head; head.next = null`) is `O(n)` stack space — mention it, then prefer the iterative one.
