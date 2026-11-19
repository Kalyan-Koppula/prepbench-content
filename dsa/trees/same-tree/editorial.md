**Key idea:** two trees are identical exactly when their roots match and their left subtrees are identical and their right subtrees are identical. Recurse on both trees in lockstep; any mismatch in shape or value ends the comparison.

## Recognising the pattern

Comparing two structures node for node is the "two trees in parallel" shape from the [Trees](/problems/patterns/trees) sheet. The base cases carry most of the logic: both empty, one empty, values different.

## Approach 1: parallel recursion (reference solution)

1. Both `null`: identical, return `true`.
2. Exactly one `null`: different shapes, return `false`.
3. Values differ: return `false`.
4. Otherwise return `isSameTree(p.left, q.left) && isSameTree(p.right, q.right)`.

The `&&` short-circuits, so the comparison stops at the first difference.

## Approach 2: compare serialisations (shown below as the alternative)

Write each tree as a preorder sequence with a marker (`#`) for every missing child, then compare the two sequences. The markers matter: without them, a root `1` with only a left child `2` and a root `1` with only a right child `2` both serialise as `1, 2`.

Correct, but it always builds both sequences in full, even if the roots already differ. Time `O(n + m)`, space `O(n + m)`.

## Walkthrough

`p = [1, 2, 3]`, `q = [1, 2, 3]`:

| call | p | q | result |
| --- | --- | --- | --- |
| root | 1 | 1 | values match, check children |
| left | 2 | 2 | match, children both null → true |
| right | 3 | 3 | match, children both null → true |

Result `true`. With `q = [1, null, 2]`, the left call compares node `2` with `null` and returns `false`.

## Complexity

- Parallel recursion: time `O(min(n, m))`, since it stops at the first difference. Space `O(h)` for the recursion.
- Serialisation: time `O(n + m)`, space `O(n + m)`.

## Edge cases

- Both empty: identical.
- One empty: different.
- Same values, different shapes: caught by the null checks.
- Same shape, one value different: caught by the value check.

## Common mistakes

- Checking `p.val` before checking for `null`.
- Comparing traversals without null markers.
- Comparing only values in an inorder traversal, which can't tell different shapes apart.

## In the interview

- Write the three base cases first, then the recursive line.
- Likely follow-ups:
  - *Is `t` a subtree of `s`?* Run this check at every node of `s`, or compare serialisations with a string search (Subtree of Another Tree).
  - *Symmetric tree?* The same function, comparing `p.left` with `q.right` and `p.right` with `q.left`.
