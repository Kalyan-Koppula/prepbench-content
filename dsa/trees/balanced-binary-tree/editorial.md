**Key idea:** compute heights bottom-up, and as soon as any node has subtrees whose heights differ by more than one, report "unbalanced" all the way up with a sentinel value such as −1. One post-order pass answers the question.

## Recognising the pattern

"Check a property at every node that depends on subtree heights" is the bottom-up shape from the [Trees](/problems/patterns/trees) sheet. The trap is computing heights separately for every node; combining "height" and "is balanced" into one return value avoids it.

## Brute force

At each node, compute the heights of both subtrees from scratch, check that they differ by at most one, then recurse into both children. That is the reference brute force below.

Correct, but heights are recomputed for every ancestor. On a chain-like tree that is `O(n²)`. Space `O(h)`.

## Optimal: height or −1

`checkHeight(node)` returns the height of the subtree, or −1 if any node inside it is unbalanced.

1. If `node` is null, return 0.
2. `left = checkHeight(node.left)`. If it is −1, return −1 immediately.
3. `right = checkHeight(node.right)`. If it is −1, return −1.
4. If `|left − right| > 1`, return −1.
5. Return `1 + max(left, right)`.

The tree is balanced exactly when `checkHeight(root)` is not −1.

**Why one value can carry both answers.** A real height is never negative, so −1 is free to mean "unbalanced". The early returns also stop the work as soon as a violation is found.

## Walkthrough

```
        1
       / \
      2   2
     / \
    3   3
   / \
  4   4
```

| node | left | right | difference | returns |
| --- | --- | --- | --- | --- |
| each 4 | 0 | 0 | 0 | 1 |
| left 3 | 1 | 1 | 0 | 2 |
| right 3 | 0 | 0 | 0 | 1 |
| left 2 | 2 | 1 | 1 | 3 |
| right 2 | 0 | 0 | 0 | 1 |
| 1 | 3 | 1 | 2 | −1 |

The root's subtrees differ by 2, so the tree is not balanced.

## Complexity

- Brute force: time `O(n²)` worst case (`O(n log n)` for balanced trees), space `O(h)`.
- Height or −1: time `O(n)`, space `O(h)`.

## Edge cases

- Empty tree: balanced.
- A single node: balanced.
- A tree that is balanced at the root but not deeper down: the check applies at every node, so it is caught.

## Common mistakes

- Checking only the root's two subtree heights.
- Comparing the minimum and maximum depth of leaves instead (a different, stricter definition).
- Forgetting to propagate −1 upward, so a deep violation is lost.

## In the interview

- Mention the `O(n²)` version and why it repeats work, then merge the two questions into one return value.
- Likely follow-ups:
  - *Make a tree balanced?* Collect values with an inorder walk and rebuild from the middle out.
  - *What do self-balancing trees guarantee?* AVL keeps exactly this property with rotations; red-black trees use a looser one.
