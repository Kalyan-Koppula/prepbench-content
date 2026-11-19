**Key idea:** do an ordinary level-order traversal, but write each level's values into its row in alternating directions: left to right on even levels, right to left on odd ones. The traversal itself never changes direction; only where each value is placed does.

## Recognising the pattern

Level-by-level output is BFS from the [Trees](/problems/patterns/trees) sheet. Zigzag is a small change on top of Binary Tree Level Order Traversal, and the cleanest version keeps the BFS untouched.

## Approach 1: BFS with alternating fill (reference solution)

1. If the tree is empty, return `[]`.
2. `level = [root]`, `leftToRight = true`.
3. While `level` is not empty:
   1. Make an array `values` of the level's size. For the `i`-th node, write its value at index `i` if `leftToRight`, otherwise at `size − 1 − i`.
   2. Build the next level from left children then right children, as usual.
   3. Flip `leftToRight`.

Filling from the back avoids a separate reverse step, and the next level is always collected in normal left-to-right order, so the logic stays simple.

## Approach 2: level order, then reverse odd rows (shown below as the alternative)

Collect normal level order (by DFS with a depth parameter, or BFS), then reverse every odd-indexed row. Same complexity, and arguably the easiest to get right in an interview.

A third option is a deque per level, adding to the back or the front depending on direction, which is the same as the alternating fill.

## Walkthrough

```
     3
    / \
   9   20
      /  \
     15   7
```

| level | nodes in BFS order | direction | row |
| --- | --- | --- | --- |
| 0 | 3 | left → right | [3] |
| 1 | 9, 20 | right → left | [20, 9] |
| 2 | 15, 7 | left → right | [15, 7] |

Result `[[3], [20, 9], [15, 7]]`.

## Complexity

- Both approaches: time `O(n)`; each node is visited once and each value written once.
- Space: `O(w)` for the BFS level, or `O(h)` recursion for DFS, plus the output.

## Edge cases

- Empty tree: `[]`.
- One node per level (a chain): direction makes no difference.
- Missing children: only real nodes are placed, so rows have different lengths.

## Common mistakes

- Switching the order in which children are **collected** instead of how values are **written**, which scrambles deeper levels.
- Starting right to left on the top level.
- Reversing the shared node array instead of the value row.

## In the interview

- Say "level order, with every other row reversed" and pick whichever version you can write cleanly.
- Likely follow-ups:
  - *Spiral order of a matrix?* A different problem, but the same "change direction each layer" bookkeeping (Spiral Matrix).
  - *Without extra space for rows?* Use two stacks: pop from one, push children onto the other in an order that depends on direction.
