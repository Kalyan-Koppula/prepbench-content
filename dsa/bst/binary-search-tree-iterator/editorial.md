**Key insight:** pause an iterative inorder traversal between steps. Its stack — the ancestors whose value hasn't been emitted yet — is the iterator's entire state.

## Approach

- **Constructor:** push the left spine of `root` (root, root.left, root.left.left, …).
- **`next()`:** pop the top node — it's the smallest remaining value. Before returning it, push the left spine of its right child.
- **`hasNext()`:** the stack is non-empty.

## Complexity

- `next()` is `O(1)` **amortised**: each node is pushed and popped exactly once over the whole iteration, though a single call may push up to `h` nodes.
- `hasNext()` is `O(1)`.
- Space `O(h)` — the stack holds at most one root-to-leaf path.

## Alternatives to mention

- Precompute the full inorder into an array and keep an index: `O(1)` per call but `O(n)` memory. Good first answer; the follow-up is usually the `O(h)` version.

## Follow-ups

- **Two-sum in a BST** with `O(h)` space: run one ascending iterator and one descending iterator (mirror: push right spines) as two pointers.
- `peek()`: return the top of the stack without popping.
- A reverse iterator (`prev`) mirrors left and right.
