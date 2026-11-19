**Key idea:** process the list one block of `k` nodes at a time. Before touching a block, check that it has `k` nodes; if not, stop. Otherwise reverse the block in place and reconnect it: the node before the block now points to the block's old last node, and the block's old first node (now last) points to whatever follows the block.

## Recognising the pattern

Reversal is the core move of the [Linked List](/problems/patterns/linked-list) sheet; this problem applies it repeatedly to sub-lists. The difficulty is purely bookkeeping: which node comes before the block, which comes after, and which nodes become the block's new first and last.

## Brute force

Copy the nodes into an array, reverse each full block of `k` positions in the array, then relink the nodes in array order. That is the reference brute force below.

Correct and `O(n)` time, but `O(n)` extra space, which the follow-up asks you to avoid.

## Optimal: reverse block by block in place

Keep `groupPrev`, the node just before the current block, starting at a dummy node in front of `head`.

1. **Find the block's last node.** Walk `k` steps from `groupPrev`. If you run out of nodes, stop: the remainder stays as it is.
2. Remember `groupNext = kth.next`, the first node after the block.
3. **Reverse the block.** Start with `prev = groupNext` instead of `null`. Then the usual reversal loop, run until `current` reaches `groupNext`, also makes the block's old first node point to `groupNext`: the block is reconnected to the rest for free.
4. **Reconnect the front.** The old first node (`groupPrev.next`) is now the block's last node. Set `groupPrev.next = kth` (the new first node), then move `groupPrev` to the old first node for the next block.
5. Return `dummy.next`.

## Walkthrough

`1 → 2 → 3 → 4 → 5`, `k = 2`

| block | before | after reversal | list so far |
| --- | --- | --- | --- |
| 1 | `1 → 2`, next is 3 | `2 → 1 → 3` | 2 → 1 → 3 → 4 → 5 |
| 2 | `3 → 4`, next is 5 | `4 → 3 → 5` | 2 → 1 → 4 → 3 → 5 |
| 3 | only `5` left (fewer than 2) | unchanged | 2 → 1 → 4 → 3 → 5 |

## Complexity

- Array: time `O(n)`, space `O(n)`.
- In place: time `O(n)`; each node is visited a constant number of times (once to count, once to reverse). Space `O(1)`.

## Edge cases

- `k = 1`: every block is a single node; the list is unchanged.
- `k` larger than the list: the first check fails and nothing changes.
- Length a multiple of `k`: every block is reversed.

## Common mistakes

- Reversing a final short block.
- Losing the node after the block, so the rest of the list is cut off.
- Forgetting to move `groupPrev` to the block's new last node.
- Not using a dummy node, which makes the first block a special case.

## In the interview

- Draw one block with `groupPrev`, `kth` and `groupNext` labelled before writing code.
- Mention the trick of starting `prev` at `groupNext`, and why it reconnects the tail.
- Likely follow-ups:
  - *Reverse the final short block too?* Drop the length check.
  - *Swap nodes in pairs?* The special case `k = 2` (Swap Nodes in Pairs).
  - *Recursive version?* Reverse the first block, then set its last node's `next` to the recursive result for the rest. `O(n / k)` stack.
