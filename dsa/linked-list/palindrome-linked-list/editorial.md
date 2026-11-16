**Key insight:** you can't walk a singly linked list backwards — so reverse the second half in place, then compare it against the first half node by node.

## Approach

1. Find the end of the first half with fast/slow pointers (`while (fast.next && fast.next.next)`), so `slow` stops on the first middle.
2. Reverse the list starting at `slow.next`.
3. Walk `head` and the reversed half together; any mismatch → `false`. The reversed half is never longer than the first half, so stop when it runs out.
4. (Optional but polite) reverse the second half back and reattach it so the caller's list is unchanged.

## Complexity

- Time `O(n)` — find middle, reverse, compare: three linear passes.
- Space `O(1)`.

## Alternatives to mention

- Copy values into an array and two-pointer it: `O(n)` space, trivially correct — the expected warm-up.
- Recursion with a pointer that advances from the front as the stack unwinds: `O(n)` stack, clever but not `O(1)`.

## Pitfalls

- Odd length: the middle element needs no partner. Stopping on the first middle and reversing from `slow.next` handles both parities.
- Mutating input is sometimes frowned upon — mention the restore step even if you skip it.
