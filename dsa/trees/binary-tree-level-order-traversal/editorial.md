**Key idea:** breadth-first search visits nodes level by level. Process the tree one level at a time: record the values of the current level, and collect their children, left before right, as the next level.

## Recognising the pattern

"Group by depth" or "process level by level" is the BFS shape from the [Trees](/problems/patterns/trees) sheet. It is the base for zigzag order, right side view, level averages and the minimum depth.

## Approach 1: BFS one level at a time (reference solution)

1. If the tree is empty, return `[]`.
2. `level = [root]`.
3. While `level` is not empty:
   1. Record the values of every node in `level`, in order.
   2. Build `next` from each node's left child, then right child, skipping nulls.
   3. `level = next`.
4. Return the recorded levels.

Building a separate `next` array makes the level boundaries explicit. The other common form uses one queue and processes exactly `queue.length` nodes per round, which is the same idea.

## Approach 2: DFS with depth (shown below as the alternative)

Walk the tree depth-first, passing the depth along. When you meet a depth for the first time, start a new list for it. Visiting the left child before the right keeps each level in left-to-right order, because within one level, nodes further left are visited first.

Same `O(n)` time. It uses `O(h)` stack space instead of a queue the width of a level.

## Walkthrough

```
    3
   / \
  9   20
     /  \
    15   7
```

| round | level | values recorded | next level |
| --- | --- | --- | --- |
| 1 | [3] | [3] | [9, 20] |
| 2 | [9, 20] | [9, 20] | [15, 7] |
| 3 | [15, 7] | [15, 7] | [] |

Result `[[3], [9, 20], [15, 7]]`.

## Complexity

- BFS: time `O(n)`, space `O(w)` for the widest level (up to about `n / 2`).
- DFS with depth: time `O(n)`, space `O(h)` for recursion, plus the output.

## Edge cases

- Empty tree: `[]`, not `[[]]`.
- A single node: `[[value]]`.
- Skewed trees: one node per level.

## Common mistakes

- Using `queue.shift()` in JavaScript, which is `O(n)` per call. Use levels or an index into the array.
- Mixing levels by reading the queue length after adding children.
- Adding the right child before the left.

## In the interview

- Mention that BFS is the natural choice and DFS with a depth parameter also works.
- Likely follow-ups:
  - *Zigzag order?* Reverse every other level, or fill each level from alternating ends (Binary Tree Zigzag Level Order Traversal).
  - *Right side view?* Take the last value of each level (Binary Tree Right Side View).
  - *Bottom-up order?* Reverse the list of levels at the end.
