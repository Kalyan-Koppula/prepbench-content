**Key insight:** it's Reverse Linked List applied group by group, plus careful stitching. Track `groupPrev` (the node before the group); find the `k`-th node ahead — if it doesn't exist, stop. Reverse the group with its tail pointing at the node after it, then hook `groupPrev` to the new group head.

## Approach

1. `dummy.next = head`; `groupPrev = dummy`.
2. Walk `k` steps from `groupPrev` to find `kth`. If you fall off the end, the remaining block is short — done.
3. `groupNext = kth.next`. Reverse the nodes from `groupPrev.next` up to `kth`, starting with `prev = groupNext` so the reversed block's tail links straight to the rest of the list.
4. The old first node of the block is now its tail: `first = groupPrev.next`; set `groupPrev.next = kth`, then `groupPrev = first`.
5. Return `dummy.next`.

## Complexity

- Time `O(n)` — each node is visited a constant number of times (once to count, once to reverse).
- Space `O(1)`.

## Alternatives to mention

- Recursive: reverse the first `k`, recurse on the rest, attach. Clean, but `O(n / k)` stack.
- Copy the values into an array and reverse chunks: `O(n)` space and violates "don't just swap values".

## Pitfalls

- Reversing a short final group — always count `k` nodes first.
- Losing the connection between groups: seeding `prev = groupNext` saves a separate reconnect step.
- `k = 1` should return the list unchanged; `k = n` reverses everything.
