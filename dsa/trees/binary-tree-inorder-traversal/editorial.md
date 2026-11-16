**Key insight:** iteratively, the stack holds exactly the ancestors whose left side you're still exploring — push the left spine, pop to visit, then hop to the right child and repeat.

## Approach (iterative, what the follow-up wants)

1. `cur = root`, empty stack.
2. While `cur` is non-null, push it and go left.
3. Pop the top: that's the leftmost unvisited node. Record its value.
4. Set `cur` to its right child and loop back to step 2. Stop when `cur` is null and the stack is empty.

## Approach (recursive)

`go(node.left); out.push(node.val); go(node.right)` — mention it first, then show you can unroll it.

## Approach (Morris, `O(1)` space)

For each node with a left child, find its inorder predecessor (rightmost node of the left subtree).
- If the predecessor's `right` is null, point it back at the current node (a temporary thread) and go left.
- If it already points at the current node, you've finished the left side: remove the thread, visit the node, go right.

Nodes without a left child are visited immediately, then you go right. The tree is restored by the time the walk ends.

## Complexity

- Recursive / stack: `O(n)` time, `O(h)` space.
- Morris: `O(n)` time (each edge walked at most a constant number of times), `O(1)` extra space — but it temporarily mutates the tree, which matters if other threads read it.

## Pitfalls

- Loop condition must be `cur || stack.length` — checking only the stack stops before the right subtree of the root is explored.
- Pre-order and post-order have their own iterative forms; post-order is the fiddly one (two stacks, or reverse a modified pre-order).
