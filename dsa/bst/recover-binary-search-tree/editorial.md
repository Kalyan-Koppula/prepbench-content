**Key insight:** a swap breaks the sorted inorder sequence in one or two places. The first wrong node is the *larger* side of the first break, the second is the *smaller* side of the last break.

## Approach

1. Inorder traverse, keeping `prev`.
2. Whenever `prev.val > cur.val`:
   - if `first` isn't set yet, set `first = prev`;
   - always set `second = cur`.
3. After the traversal, swap `first.val` and `second.val`.

Example: sorted `1 2 3 4 5` with `2` and `4` swapped reads `1 4 3 2 5` — breaks at `4 > 3` and `3 > 2`, so `first = 4`, `second = 2`. With neighbours swapped (`1 3 2 4 5`) there's one break, `3 > 2`, and both assignments happen on it.

## Complexity

- Time `O(n)`; space `O(h)` for the stack (iterative or recursive).

## Follow-up: `O(1)` space

Run the same logic inside a **Morris inorder traversal**: thread each node's inorder predecessor back to it instead of using a stack, visit nodes in order, and remove the threads as you go. Don't swap until the traversal has finished and restored every thread.

## Alternatives to mention

- Collect the inorder values, sort them, and write them back in inorder: `O(n log n)` time, `O(n)` space. Works, but ignores that only two values are wrong.

## Pitfalls

- Stopping at the first break — wrong whenever the swapped values aren't neighbours in sorted order.
- Swapping nodes (re-linking pointers) instead of values: unnecessary and error-prone.
