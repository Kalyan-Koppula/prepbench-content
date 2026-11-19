**Key idea:** search for both targets in one post-order pass. Each call reports what it found in its subtree: nothing, one target, or the answer. The first node that receives a target from **both** sides is where the two root paths split, which is the lowest common ancestor. If a node is itself a target, it is the answer for its branch.

## Recognising the pattern

The answer depends on information coming up from both subtrees, which is the bottom-up shape from the [Trees](/problems/patterns/trees) sheet. In a general binary tree (not a BST) values don't tell you which side to search, so you have to search both and combine.

## Brute force

Find the path from the root to `p` and the path from the root to `q` (each by DFS with backtracking). The LCA is the last node the two paths share. That is the reference brute force below.

Correct and `O(n)` time, but it walks the tree twice and stores two paths: `O(h)` extra space beyond the recursion. It is a fine first answer.

## Optimal: one recursive search

`findLca(node)` returns:

- `null` if neither target is in this subtree,
- the target node if exactly one is,
- the LCA if both are.

1. If `node` is null, return null.
2. If `node` is `p` or `q`, return `node`. If the other target is below it, this node is the LCA anyway, because a node counts as its own ancestor.
3. `left = findLca(node.left)`, `right = findLca(node.right)`.
4. If both are non-null, the targets are on different sides: return `node`.
5. Otherwise return whichever side is non-null (passing the target or the LCA upward).

**Why it is correct.** The LCA is the only node where the targets are in different subtrees, or which is itself one target with the other below it. Below the LCA, each call sees at most one target; at the LCA, both meet; above it, the LCA is simply passed upward.

## Walkthrough

```
        3
      /   \
     5     1
    / \   / \
   6   2 0   8
      / \
     7   4
```

`p = 5`, `q = 4`:

| node | left result | right result | returns |
| --- | --- | --- | --- |
| 5 | – | – | 5 (it is a target; no need to look below) |
| 1 | null | null | null |
| 3 | 5 | null | 5 |

Answer `5`: it is a target, and `4` is in its subtree. With `p = 6`, `q = 4`, node `5` would receive `6` from the left and `4` from the right and return itself.

## Complexity

- Two paths: time `O(n)`, space `O(h)` for the paths plus recursion.
- One search: time `O(n)`, space `O(h)` for the recursion.

## Edge cases

- One target is the root: return the root immediately.
- One target is an ancestor of the other: the ancestor is returned without visiting the descendant.
- Targets in different subtrees of the root: the root is the answer.

## Common mistakes

- Treating the tree as a BST and comparing values.
- Continuing to search below a target node and double-counting.
- Forgetting that the problem guarantees both targets exist. If not guaranteed, you need to confirm both were actually found.

## In the interview

- Explain the three possible return meanings before coding.
- Likely follow-ups:
  - *Binary search tree?* Walk down: go left if both are smaller, right if both are larger, otherwise stop (LCA of a BST).
  - *Nodes have parent pointers?* Walk up from both like finding the intersection of two linked lists.
  - *Targets might be missing?* Return found-flags too, and check both were found.
