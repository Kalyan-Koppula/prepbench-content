---
title: Binary Trees
order: 7
summary: Trust the recursive call for each child, combine their answers at the node, and choose the visiting order (pre, in, post or level) that the question needs.
---

## The idea

A binary tree is recursive: every node is a value plus two smaller binary trees, either of which may be empty. Tree solutions use that directly. You write a function that answers the question for **one node**, *assuming* it already has the answers for its two subtrees. The recursion supplies those answers, and the empty tree (`null`) is the base case that stops it.

The second decision is **order**: when a node does its own work relative to its children. One tree, four orders:

```
          1
        /   \
       2     3
      / \     \
     4   5     6
        /
       7
```

| Order | Rule at each node | Sequence | Typical use |
| --- | --- | --- | --- |
| Preorder | node, left, right | 1 2 4 5 7 3 6 | Pass state down, copy or serialise |
| Inorder | left, node, right | 4 2 7 5 1 3 6 | Sorted order in a BST, splitting for construction |
| Postorder | left, right, node | 4 7 5 2 6 3 1 | Heights, sums, anything built from children |
| Level order | by distance from root | [1] [2 3] [4 5 6] [7] | Per-level and nearest-to-root questions |

The first three are depth-first (DFS): they differ only in where the node's own work sits in a recursive function. Level order is breadth-first (BFS) and uses a queue.

Information moves through a DFS in two directions. **Down**, as parameters: the maximum on the path so far, the depth, a column number. **Up**, as return values: a subtree's height, whether it is balanced, whether it contains a target. Harder problems use both, or return one value to the parent while recording another in a variable outside the recursion.

## When to reach for it

Signals in the statement:

- The input is a `root`, and the answer can be built from answers for subtrees: height, size, sum, "true at every node".
- "Level", "depth", "row", "right view", "closest to the root": BFS by level.
- "Path between two nodes", "diameter": a DFS that returns a downward length and records a path that turns.
- "Ancestor", "contains both": a DFS that returns what it found in each subtree.
- "Every node on the path from the root has ...": a DFS that passes the path's summary down.
- "Rebuild the tree from these sequences", "flatten": construction or rewiring by recursion.

Look-alikes that need something else:

| Statement says | Why plain tree DFS falls short | Use instead |
| --- | --- | --- |
| The tree is a binary **search** tree | Ordering lets you skip whole subtrees, `O(h)` instead of `O(n)` | [BST pattern](/problems/patterns/bst) |
| Edges given as a list, or nodes with several parents | There may be cycles, so you need a visited set | [Graphs](/problems/patterns/graphs) |
| You must move **up** from a node (distance from a target) | Child pointers only go down | A parent map, then BFS as on a graph |
| Pick nodes to maximise a total, no two adjacent | Each node needs two answers | Tree DP: return `[taken, skipped]` from the DFS |

## How it works

Take the diameter, the longest path between two nodes in edges, on the tree above. Let `height(node)` be the number of nodes on the longest downward path from `node`, with `height(null) = 0`. A path that turns at `node` goes down `height(left)` edges on one side and `height(right)` on the other, so its length is `height(left) + height(right)`.

Postorder visits children before parents, so each row can use the rows above it:

| Visit | Node | height(left) | height(right) | Path turning here | Returned height | best |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 4 | 0 | 0 | 0 | 1 | 0 |
| 2 | 7 | 0 | 0 | 0 | 1 | 0 |
| 3 | 5 | 1 | 0 | 1 | 2 | 1 |
| 4 | 2 | 1 | 2 | 3 | 3 | 3 |
| 5 | 6 | 0 | 0 | 0 | 1 | 3 |
| 6 | 3 | 0 | 1 | 1 | 2 | 3 |
| 7 | 1 | 3 | 2 | 5 | 4 | 5 |

The answer is 5: the path `7 - 5 - 2 - 1 - 3 - 6`.

**Why it is correct.** Induction on subtree size. The empty tree returns the right value by definition; if both recursive calls are correct for their smaller trees, the formula at the node is correct for its tree. You never trace the whole recursion in your head, you only check the base case and the one-node step. For the diameter, every path has exactly one highest node, and the table tries every node as that highest node, so no path is missed.

**Why it is fast.** Each node is entered once and does `O(1)` work besides its two calls, so the total is `O(n)`. The call stack holds the current root-to-node path, `O(h)` extra space. Calling a separate `height` helper from every node instead would recompute subtrees and cost `O(n²)` on a chain; returning the height and using it at once removes that waste.

## Templates

All templates assume a node with `val`, `left` and `right`, where a missing child is `null`.

### Bottom-up: combine the children's answers

```ts
function solve(node: TreeNode | null): number {
  if (node === null) return 0 // the answer for an empty tree
  const leftAnswer = solve(node.left)
  const rightAnswer = solve(node.right)
  return combine(node.val, leftAnswer, rightAnswer)
}
```

- Decide the empty-tree value first: `0` for height and size, `true` for "balanced" or "same", `-Infinity` for a maximum.
- Call each child once and keep the result. Calling it again inside `combine` is how `O(n)` becomes `O(n²)`.

### Top-down: pass the path's state as parameters

```ts
function countGood(node: TreeNode | null, maxOnPath: number): number {
  if (node === null) return 0
  let here = 0
  if (node.val >= maxOnPath) {
    here = 1
  }
  const nextMax = Math.max(maxOnPath, node.val)
  return here + countGood(node.left, nextMax) + countGood(node.right, nextMax)
}
```

- The parameter describes the path from the root to this node, not the whole tree. Start with a neutral value: `countGood(root, -Infinity)`.
- A number is copied into each call, so nothing needs undoing. If you pass an array such as the current path, push before recursing and pop after, or the left branch leaks into the right.

### Return one thing, record another

```ts
function longestPath(root: TreeNode | null): number {
  let best = 0
  function down(node: TreeNode | null): number {
    if (node === null) return 0
    const left = down(node.left)
    const right = down(node.right)
    best = Math.max(best, left + right) // a path that turns at this node
    return 1 + Math.max(left, right) // the parent can extend only one side
  }
  down(root)
  return best
}
```

- Return only what the **parent** can extend. A path using both sides cannot continue upward, so it goes into `best`.
- Watch units: `down` counts nodes, and `left + right` equals the edges of the turning path.

### BFS by level

```ts
function levelOrder(root: TreeNode | null): number[][] {
  const levels: number[][] = []
  if (root === null) return levels
  const queue: TreeNode[] = [root]
  let head = 0
  while (head < queue.length) {
    const levelEnd = queue.length // queue[head .. levelEnd - 1] is one level
    const level: number[] = []
    while (head < levelEnd) {
      const node = queue[head]
      head++
      level.push(node.val)
      if (node.left !== null) queue.push(node.left)
      if (node.right !== null) queue.push(node.right)
    }
    levels.push(level)
  }
  return levels
}
```

- Read `queue.length` into `levelEnd` **before** the inner loop. Children pushed during it belong to the next level.
- The `head` index makes each dequeue `O(1)`. `queue.shift()` moves every remaining element.
- Check children for `null` before pushing them.

### Iterative inorder

```ts
function inorder(root: TreeNode | null): number[] {
  const result: number[] = []
  const stack: TreeNode[] = []
  let current = root
  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current) // come back to it after its left subtree
      current = current.left
    }
    const node = stack[stack.length - 1]
    stack.pop()
    result.push(node.val)
    current = node.right
  }
  return result
}
```

- The outer condition needs both parts: the stack can be empty while `current` still points into a right subtree.
- Iterative preorder is simpler: pop, visit, push right then left.

### Construction from two traversals

```ts
function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  const position = new Map<number, number>()
  for (let i = 0; i < inorder.length; i++) {
    position.set(inorder[i], i)
  }
  let next = 0 // preorder[next] is the root of the next subtree to build
  function build(lo: number, hi: number): TreeNode | null {
    if (lo > hi) return null // this range of inorder is empty
    const node = new TreeNode(preorder[next])
    next++
    const mid = position.get(node.val)
    if (mid === undefined) return null // cannot happen for valid input
    node.left = build(lo, mid - 1) // preorder lists the left subtree first
    node.right = build(mid + 1, hi)
    return node
  }
  return build(0, inorder.length - 1)
}
```

- Pass index ranges, not sliced arrays; slicing copies `O(n)` values per call.
- The recursive calls must run in the order the consumed traversal lists subtrees. Building right first reads the wrong roots.

### Choosing a template

- Depends on the subtrees: **bottom-up**. Depends on the ancestors: **top-down**.
- A path that may turn at some node: **return one, record another**.
- Levels, rows, fewest steps from the root: **BFS by level**.
- Sorted order from a BST, or no recursion allowed: **iterative inorder**.
- Sequences in, tree out: **construction**.

## Choosing the state

What you pass down and return up decides whether one pass is enough:

| Question | Pass down | Return up | Record on the side |
| --- | --- | --- | --- |
| Height, size, sum | nothing | the subtree's value | nothing |
| Balanced | nothing | height, or `-1` for "unbalanced below" | nothing |
| Good nodes, root-to-leaf sums | path maximum or sum | count found below | nothing |
| Diameter, maximum path sum | nothing | best one-sided value | best two-sided value |
| Lowest common ancestor | the two targets | the node found here, or `null` | nothing |
| Right view by DFS | depth | nothing | first value at each depth |
| Vertical order | row and column | nothing | `(column, row, value)` triples |

When one value is not enough, return a small array such as `[height, isBalanced]`. That is still `O(1)` per node.

## Worked problems

**Diameter of Binary Tree.** The return-one-record-another template as written. Return the height, because that is what a parent can extend; record `left + right`, the path turning here. The twist is that the longest path need not touch the root, so the answer lives in `best`, not in the root's return value.

**Binary Tree Right Side View.** One node per level is visible: the last one from the left. With BFS, take the last value of each level. With DFS, visit right before left and pass the depth down; the first node reached at a new depth is the visible one, so push it when `depth === result.length`.

**Lowest Common Ancestor of a Binary Tree.** Each call returns the target it found in its subtree, or `null`. A node that is `p` or `q` returns itself at once: if the other target lies below, this node is the answer anyway. Otherwise ask both children. If both report something, the targets sit on different sides and this node is where their paths meet. If one side reports, pass it up unchanged. The twist: one return value means either "found a target" or "found the answer", and the parent never needs to know which.

**Construct Binary Tree from Preorder and Inorder Traversal.** Preorder names the root; inorder says which values lie on each side of it. Look up the root's inorder position in a `Map`, recurse on the left range and then the right, and consume preorder with one shared index. The twist is that shared index: it only works if the left subtree is built before the right.

## Variations and tricks

- **Sentinel for early failure.** For "balanced", return `-1` once a subtree fails and check for it right after each call. One pass replaces a height call per node.
- **Drop negative branches.** In maximum path sum, use `Math.max(0, down(child))`. Start `best` at `-Infinity`, since an all-negative tree still has an answer.
- **Level-size snapshot.** Zigzag, right view and level averages are the BFS template with a different action per level. For zigzag, enqueue left to right as usual and only reverse how the level is written.
- **Coordinates on nodes.** Vertical order passes `(row, column)` down: left child is column minus one, right child column plus one. Collect triples, then sort.
- **Parent map.** When the answer needs upward moves, record each node's parent in one traversal, then BFS from the target over left, right and parent with a visited set.
- **Serialise with null markers.** Writing trees in preorder with a marker for every `null` turns "is this a subtree" into a string search. Without markers, different shapes give the same string.
- **Rewire with a predecessor.** To flatten in preorder, hang each node's right subtree on the rightmost node of its left subtree, then move the left subtree to the right. Extra space is `O(1)`.

## Complexity

- Time `O(n)` for one DFS or BFS: each node is visited once with `O(1)` work. Add `O(n log n)` when the answer needs a sort (vertical order), and expect `O(m · n)` for the simple subtree check that compares from every node.
- Space `O(h)` for recursive DFS: `O(log n)` balanced, `O(n)` for a chain. BFS holds the widest level, up to about `n / 2`. Maps for construction or parents add `O(n)`.

## Pitfalls

- Missing the empty-tree case, or treating `null` as a leaf. A leaf is a node with `node.left === null && node.right === null`.
- Counting nodes when the question counts edges. Depth here counts nodes; diameter counts edges.
- Checking a node only against its children when the property is about whole subtrees (balance at every node, BST ordering).
- Returning the two-sided path to the parent in path problems.
- `queue.shift()` in BFS, or reading `queue.length` after children were pushed.
- Overwriting `node.left` or `node.right` before saving the old child when rewiring.
- Forgetting to pop from a shared path array after the recursive calls.

## Practice ladder

1. [Invert Binary Tree](/problems/invert-binary-tree): the smallest recursion, a swap at every node.
2. [Maximum Depth of Binary Tree](/problems/maximum-depth-of-binary-tree): the bottom-up template returning a height.
3. [Same Tree](/problems/same-tree): recursing over two trees at once, `null` cases first.
4. [Binary Tree Inorder Traversal](/problems/binary-tree-inorder-traversal): traversal order and the explicit-stack version.
5. [Diameter of Binary Tree](/problems/diameter-of-binary-tree): return the height, record the path that turns.
6. [Balanced Binary Tree](/problems/balanced-binary-tree): a sentinel return so one pass checks every node.
7. [Subtree of Another Tree](/problems/subtree-of-another-tree): a same-tree check from every node, or serialisation.
8. [Binary Tree Level Order Traversal](/problems/binary-tree-level-order-traversal): the BFS template with a level-size snapshot.
9. [Binary Tree Zigzag Level Order Traversal](/problems/binary-tree-zigzag-level-order-traversal): change how a level is written, not how it is enqueued.
10. [Binary Tree Right Side View](/problems/binary-tree-right-side-view): one node per level, by BFS or depth-aware DFS.
11. [Count Good Nodes in Binary Tree](/problems/count-good-nodes-in-binary-tree): the top-down template with a running maximum.
12. [Boundary of Binary Tree](/problems/boundary-of-binary-tree): one answer split into separate passes without double counting.
13. [Lowest Common Ancestor of a Binary Tree](/problems/lowest-common-ancestor-of-a-binary-tree): return what you found and combine the two sides.
14. [All Nodes Distance K in Binary Tree](/problems/all-nodes-distance-k-in-binary-tree): a parent map turns the tree into a graph for BFS.
15. [Construct Binary Tree from Preorder and Inorder Traversal](/problems/construct-binary-tree-from-preorder-and-inorder-traversal): index ranges plus a shared preorder index.
16. [Flatten Binary Tree to Linked List](/problems/flatten-binary-tree-to-linked-list): rewiring pointers in place in preorder.
17. [Vertical Order Traversal of a Binary Tree](/problems/vertical-order-traversal-of-a-binary-tree): coordinates passed down, then a sort with tie-breaks.
18. [Binary Tree Maximum Path Sum](/problems/binary-tree-maximum-path-sum): return one side, record both, drop negative branches.
