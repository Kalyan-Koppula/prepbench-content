**Key idea:** every path has a highest node, where it may bend and use both children. For each node, compute the best path going **down** from it (its value plus the better of its two branches, ignoring negative ones). The best path bending at that node is its value plus both non-negative branch gains. Track the maximum of those over all nodes in one post-order pass.

## Recognising the pattern

This is the hardest version of the "return one thing, record another" shape from the [Trees](/problems/patterns/trees) sheet, the same skeleton as Diameter of Binary Tree. The function returns what the parent can use (one branch, since a path can't fork upward) and records what a path ending here can achieve (both branches).

## Brute force

Try every node as the highest point of the path. For each, compute the best downward sums of its two children from scratch, dropping negative ones, and add them to the node's value. That is the reference brute force below.

Correct, but each node recomputes its subtrees: `O(n²)` for a chain-shaped tree.

## Optimal: one post-order pass

`maxGain(node)` returns the best sum of a path that starts at `node` and goes down.

1. If `node` is null, return 0.
2. `left = max(maxGain(node.left), 0)`, `right = max(maxGain(node.right), 0)`. A negative gain is replaced with 0, meaning "don't extend into that branch".
3. `best = max(best, node.val + left + right)`: the best path whose highest node is this one.
4. Return `node.val + max(left, right)`: a path continuing upward can use only one branch.

Start with `best = −∞`, not 0: if every value is negative, the answer is the largest single value, and a path must contain at least one node.

## Walkthrough

```
    -10
    /  \
   9    20
       /  \
      15   7
```

| node | left gain | right gain | path bending here | best | returns |
| --- | --- | --- | --- | --- | --- |
| 9 | 0 | 0 | 9 | 9 | 9 |
| 15 | 0 | 0 | 15 | 15 | 15 |
| 7 | 0 | 0 | 7 | 15 | 7 |
| 20 | 15 | 7 | 42 | 42 | 35 |
| −10 | 9 | 35 | 34 | 42 | 25 |

Answer `42`: the path `15 → 20 → 7`. The root's own best bending path, `9 → −10 → 20 → 15`, sums to 34.

## Complexity

- Brute force: time `O(n²)` worst case, space `O(h)`.
- One pass: time `O(n)`, space `O(h)` for the recursion.

## Edge cases

- All values negative: the answer is the largest single value. Branch gains are clamped to 0 and `best` starts at −∞.
- A single node: its value.
- The best path doesn't touch the root: caught at its own highest node.

## Common mistakes

- Returning `node.val + left + right` to the parent, which describes a forked "path".
- Not clamping negative gains to 0.
- Initialising `best` to 0, which is wrong for all-negative trees.

## In the interview

- Draw the two quantities: "what I return to my parent" (one branch) and "what I record" (both branches).
- Likely follow-ups:
  - *Return the path itself?* Track which branches were used at the best node and walk them down.
  - *Longest path with equal values?* The same shape with a different gain rule (Longest Univalue Path).
  - *Path sums equal to a target, going downward only?* Prefix sums along the root path with a map (Path Sum III).
