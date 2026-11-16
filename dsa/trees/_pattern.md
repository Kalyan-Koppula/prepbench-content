---
title: Binary Trees
order: 7
summary: Solve it for one node assuming the children are already solved — then pick DFS or BFS for the order.
---

## Recognise it

- Input is a `root`; the answer depends on subtrees (height, sums, "is X true everywhere").
- "Per level", "left/right view", "closest to the root" → BFS level order.
- "Path", "diameter", "ancestor" → DFS that returns information up to the parent.
- Build a tree from traversals, or flatten/serialise one.

## Templates

```ts
// DFS: answer for a node from its children's answers
function height(node: TreeNode | null): number {
  if (!node) return 0
  return 1 + Math.max(height(node.left), height(node.right))
}

// BFS level order: snapshot the queue size to separate levels
const levels: number[][] = []
let queue = root ? [root] : []
while (queue.length) {
  const next: TreeNode[] = []
  levels.push(queue.map((n) => n.val))
  for (const n of queue) {
    if (n.left) next.push(n.left)
    if (n.right) next.push(n.right)
  }
  queue = next
}

// Return info up, track the global answer on the side
let best = 0
function down(node: TreeNode | null): number {
  if (!node) return 0
  const l = down(node.left)
  const r = down(node.right)
  best = Math.max(best, l + r)   // answer that "bends" at this node
  return 1 + Math.max(l, r)      // what the parent can extend
}

// Iterative inorder: push the left spine, pop, step right
const stack: TreeNode[] = []
let cur = root
while (cur || stack.length) {
  while (cur) { stack.push(cur); cur = cur.left }
  cur = stack.pop()!
  visit(cur)
  cur = cur.right
}
```

## Interview notes

- Say which order you need: pre (top-down state, copying), in (BST sorted order), post (children first — heights, sums), level (distance from root).
- Top-down: pass state as parameters (max so far, depth, bounds). Bottom-up: return it.
- When the answer "bends" through a node but the parent can only extend one branch, return one thing and record another in an outer variable.
- Recursion depth is the tree height: `O(log n)` balanced, `O(n)` skewed. Offer an explicit stack if the interviewer worries about overflow.
- For "go upward" questions (distance k, burning tree), build a parent map, then treat the tree as an undirected graph.
- In JS, `queue.shift()` is `O(n)`; use per-level arrays or a head index.

## Pitfalls

- Forgetting the `null` root / single-node case.
- Leaf check is `!node.left && !node.right`, not `!node`.
- Comparing only a node with its children when the property is about whole subtrees (BST validity, balance).
- Mixing "number of nodes" and "number of edges" for depth and diameter.
- Mutating the tree while still needing the original pointers (flatten, invert) — save children first.
