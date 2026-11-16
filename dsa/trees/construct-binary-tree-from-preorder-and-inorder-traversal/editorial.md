**Key insight:** preorder tells you *who* the root is; inorder tells you *how many* nodes go left and right of it.

## Approach

1. Map each value to its index in `inorder`.
2. Keep a pointer `pre` into `preorder`. `build(lo, hi)` builds the subtree whose inorder range is `[lo, hi]`:
   - If `lo > hi`, return `null`.
   - The next preorder value is this subtree's root; advance `pre`.
   - Let `mid` be its inorder index. Build the left subtree from `[lo, mid - 1]` **first**, then the right from `[mid + 1, hi]` — preorder lists the entire left subtree before the right.
3. Return `build(0, n - 1)`.

## Complexity

- Time `O(n)` — each node is created once with an O(1) map lookup.
- Space `O(n)` for the map, plus `O(h)` recursion.

## Alternatives to mention

- The direct version — `indexOf` in `inorder` and `slice` both arrays per call — is `O(n²)` on a skewed tree. Good to start with, then optimise.

## Pitfalls

- Building the right subtree before the left breaks the shared preorder pointer.
- Uniqueness of values is what makes the inorder split unambiguous; with duplicates the tree isn't determined.

## Follow-ups

- Inorder + postorder: consume postorder from the end and build the **right** subtree first.
- Preorder + postorder alone doesn't determine a unique tree unless every node has 0 or 2 children.
