**Key insight:** keep two pointers exactly `n` nodes apart. When the front one reaches the last node, the back one sits just before the node to remove. Starting both at a dummy node handles removing the head.

## Approach

1. `dummy = new ListNode(0, head)`; `fast = slow = dummy`.
2. Move `fast` forward `n` steps.
3. Move both until `fast.next` is `null`. Now `slow.next` is the target.
4. Unlink it: `slow.next = slow.next.next`. Return `dummy.next`.

## Complexity

- Time `O(L)` for a list of length `L` — one pass.
- Space `O(1)`.

## Alternatives to mention

- Two passes: count `L`, then walk to node `L - n` and unlink. Same big-O, and perfectly acceptable unless the interviewer insists on one pass.

## Pitfalls

- Removing the head (`n === L`) without a dummy node — `slow` would need to be "before the head".
- Off-by-one in the gap: after step 2, `fast` is `n` nodes ahead of `slow`, so stopping at `fast.next === null` (not `fast === null`) leaves `slow` before the target.
