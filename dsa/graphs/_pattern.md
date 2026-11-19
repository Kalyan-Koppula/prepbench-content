---
title: Graphs
order: 12
summary: Turn grids, dependencies and word lists into nodes and edges, then pick the traversal that answers the question — BFS for fewest steps, DFS for reachability, Kahn for ordering, union-find for connectivity.
---

## The idea

A graph is just **things** (nodes) and **links between them** (edges). Most graph questions in interviews do not say "graph". They hand you a grid of land and water, a list of course prerequisites, or a dictionary of words, and the first job is to see the nodes and edges hiding inside:

| Input | Node | Edge |
| --- | --- | --- |
| Grid of cells | one cell `(r, c)` | to the 4 cells sharing a side, if both are passable |
| Pairs `[a, b]` over `0..n-1` | one number | the pair itself, one way or both ways |
| Word list | one word | two words that differ in exactly one letter |

Once you have that picture, almost every problem is one of four questions, and each has a standard tool:

- **What can I reach from here?** Depth-first search (DFS) or breadth-first search (BFS). Either works.
- **How few steps to get there?** BFS, because it explores in rings of equal distance.
- **In what order can I process things that depend on each other?** Topological sort.
- **Are these two connected, and does this new edge close a loop?** Union-find.

BFS is the one to picture first. It spreads out from the start like a ripple: first every cell one step away, then every cell two steps away, and so on.

```
grid  (S start, # wall)        distance when BFS first reaches each cell
S  .  .  #                     0  1  2  #
.  #  .  .                     1  #  3  4
.  .  .  #                     2  3  4  #
```

Each cell is reached for the first time by a shortest route, so the number written there is its distance. Nothing about that changes if the ripple starts from several cells at once, which is the trick behind half the problems in this section.

## When to reach for it

Signals in the statement:

- A grid where something **spreads**, **connects**, **flows** or **fills** to neighbouring cells.
- Items numbered `0..n-1` with **pairs**, **edges**, **prerequisites** or **dependencies** between them.
- "Minimum number of steps, moves, minutes or transformations", where every move costs the same.
- "Count the groups", "largest region", "are all of these connected".
- "Is there a valid order", "can all tasks be finished": a dependency graph, so a topological sort or a cycle check.
- "Which edge is extra", "is this a tree": union-find, or an edge count plus a connectivity check.

Look-alikes that need something else:

| Statement says | Why plain BFS/DFS falls short | Use instead |
| --- | --- | --- |
| Cheapest path with different edge costs | BFS counts edges, not total cost | Dijkstra, in [Advanced Graphs](/problems/patterns/advanced-graphs) |
| Connect every node with the least total cost | Reachability says nothing about cost | A minimum spanning tree (Prim or Kruskal), in [Advanced Graphs](/problems/patterns/advanced-graphs) |
| Find a path that spells a word, without reusing a cell | Visited must be undone when you back out of a path | Backtracking |
| Count every distinct path | A visited set would hide the repeat paths you need | Dynamic programming over a DAG or grid |
| Rooted structure with `left`/`right` pointers | No cycles and no visited set needed | The trees pattern |

## How it works

Every traversal has the same skeleton: a **frontier** of nodes waiting to be expanded, and a **visited** marker so no node is expanded twice. BFS keeps the frontier in a queue (first in, first out). DFS keeps it on a stack, either the call stack via recursion or an explicit array.

The invariant that makes BFS give shortest distances: **the queue always holds nodes at distance `d` followed by nodes at distance `d + 1`, and nothing else.** A node at distance `d` is popped only after every node at distance `d - 1`, so the first edge that reaches a new node comes from the nearest possible layer. That first arrival is a shortest path, so you record the distance and mark the node right then.

With several sources, put all of them in the queue at distance `0` before the loop starts. It is the same as adding one invisible super-source joined to each of them: the ripple starts from every source together, and each cell gets its distance to the **nearest** source in one pass.

Walk through Rotting Oranges on this crate (`2` rotten, `1` fresh, `0` empty):

```
2 1 1 0
1 1 0 1
0 1 1 2
```

Seed the queue with both rotten oranges, count the 7 fresh ones, and process the queue one level (one minute) at a time:

| minute | cells in this level of the queue | fresh left |
| --- | --- | --- |
| 0 | (0,0), (2,3) | 7 |
| 1 | (0,1), (1,0), (1,3), (2,2) | 3 |
| 2 | (0,2), (1,1), (2,1) | 0 |

Cell `(1,1)` is next to both `(0,1)` and `(1,0)`. It is pushed once, by whichever of them is processed first, because it is marked rotten the moment it is pushed. When the queue empties, no fresh orange is left, so the answer is `2`. If any had been left, the answer would be `-1`.

Why it is fast: each cell is pushed once and popped once, and each pop looks at 4 neighbours. That is `O(rows · cols)` total, the same as reading the grid.

## Templates

The direction arrays and the cell encoding are shared by all grid templates. Packing `(r, c)` into one number `r * cols + c` keeps the queue a plain `number[]`.

```ts
const DR = [1, -1, 0, 0]
const DC = [0, 0, 1, -1]
```

### Building an adjacency list

```ts
function buildAdjacency(n: number, edges: number[][], directed: boolean): number[][] {
  const adj: number[][] = []
  for (let i = 0; i < n; i++) {
    adj.push([])
  }
  for (const edge of edges) {
    adj[edge[0]].push(edge[1])
    if (!directed) {
      adj[edge[1]].push(edge[0])
    }
  }
  return adj
}
```

- Create a list for **every** node `0..n-1`, not only the ones that appear in an edge. Isolated nodes still count as components and still belong in a course order.
- Undirected edges go in both lists. Forgetting the second push is a silent bug: the traversal just misses half the graph.

### Grid BFS, one or many sources

```ts
function gridDistances(grid: number[][], sources: number[][]): number[][] {
  const rows = grid.length
  const cols = grid[0].length
  const dist: number[][] = []
  for (let r = 0; r < rows; r++) {
    dist.push(new Array(cols).fill(-1)) // -1 means not reached yet
  }
  const queue: number[] = []
  for (const source of sources) {
    dist[source[0]][source[1]] = 0
    queue.push(source[0] * cols + source[1])
  }
  let head = 0
  while (head < queue.length) {
    const cell = queue[head]
    head++
    const r = Math.floor(cell / cols)
    const c = cell % cols
    for (let d = 0; d < 4; d++) {
      const nr = r + DR[d]
      const nc = c + DC[d]
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (!isOpen(grid, nr, nc) || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1 // mark when pushing, not when popping
      queue.push(nr * cols + nc)
    }
  }
  return dist
}
```

- `isOpen` stands for the problem's rule: not a wall, same colour as the start, at least as high as the current cell.
- The `head` index replaces `queue.shift()`, which moves every remaining element and turns the BFS quadratic.
- Set the distance (or the visited flag) **before** pushing. If you wait until the pop, a cell with two already-queued neighbours is pushed twice, and on a big open grid the queue blows up.
- `dist` doubles as the visited set. `-1` is safe because real distances are never negative.

### BFS level by level

When the answer is "how many minutes" or "how many rounds", process one ring at a time:

```ts
let rounds = 0
let head = 0
while (head < queue.length) {
  const levelEnd = queue.length // everything before levelEnd is in the current ring
  while (head < levelEnd) {
    const cell = queue[head]
    head++
    // expand cell exactly as in gridDistances, pushing onto queue
  }
  if (queue.length > levelEnd) {
    rounds++ // count a round only if it reached something new
  }
}
```

- Taking `levelEnd` before the inner loop freezes the ring's size; cells pushed during the ring belong to the next one.
- The last ring always reaches nothing. Counting it anyway gives an answer one too large.

### DFS on a grid

```ts
function fillArea(grid: number[][], r: number, c: number): number {
  if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return 0
  if (grid[r][c] !== 1) return 0
  grid[r][c] = 2 // mark before recursing, so neighbours cannot come back here
  let area = 1
  for (let d = 0; d < 4; d++) {
    area += fillArea(grid, r + DR[d], c + DC[d])
  }
  return area
}
```

- Writing a new value into the grid is the visited marker. Ask first whether the input may be changed; if not, keep a separate `boolean[][]`.
- Recursion depth can reach `rows · cols`. A 300 x 300 island is 90,000 frames, which can overflow the JavaScript stack. For large grids, run the BFS template instead, or swap the queue for a stack (`pop()` from the end). For "is it reachable" and "how big is it", the visiting order does not matter.

### Topological sort (Kahn's algorithm)

```ts
function topologicalOrder(n: number, adj: number[][]): number[] {
  const indegree = new Array(n).fill(0)
  for (let u = 0; u < n; u++) {
    for (const v of adj[u]) {
      indegree[v]++
    }
  }
  const queue: number[] = []
  for (let u = 0; u < n; u++) {
    if (indegree[u] === 0) queue.push(u)
  }
  let head = 0
  while (head < queue.length) {
    const u = queue[head]
    head++
    for (const v of adj[u]) {
      indegree[v]--
      if (indegree[v] === 0) queue.push(v)
    }
  }
  // Nodes on a cycle never reach indegree 0, so they never enter the queue.
  return queue.length === n ? queue : []
}
```

- `indegree[v]` is the number of things `v` still waits for. A node is ready once nothing is left.
- The queue is also the answer: nodes enter it in a valid order.
- Edge direction comes from the statement. For a prerequisite `[a, b]` meaning "`b` before `a`", the edge is `b -> a`, so `adj[b].push(a)`. Getting this backwards still detects cycles correctly but returns the order reversed.

### Cycle detection with three-colour DFS

```ts
const WHITE = 0 // not visited
const GREY = 1 // on the current DFS path
const BLACK = 2 // finished, and no cycle through it

function hasDirectedCycle(n: number, adj: number[][]): boolean {
  const state = new Array(n).fill(WHITE)
  function visit(u: number): boolean {
    state[u] = GREY
    for (const v of adj[u]) {
      if (state[v] === GREY) return true // an edge back onto the current path
      if (state[v] === WHITE && visit(v)) return true
    }
    state[u] = BLACK
    return false
  }
  for (let u = 0; u < n; u++) {
    if (state[u] === WHITE && visit(u)) return true
  }
  return false
}
```

- Two colours are not enough for directed graphs. Reaching a `BLACK` node is fine: it was finished on another branch. Only a `GREY` node means you have looped back onto yourself.
- For **undirected** graphs this test is wrong, because every edge leads straight back to the parent. Skip the parent, or use union-find.

### Union-find

```ts
class UnionFind {
  parent: number[] = []
  size: number[] = []

  constructor(n: number) {
    for (let i = 0; i < n; i++) {
      this.parent.push(i)
      this.size.push(1)
    }
  }

  find(x: number): number {
    let root = x
    while (this.parent[root] !== root) {
      root = this.parent[root]
    }
    let node = x
    while (node !== root) {
      const next = this.parent[node]
      this.parent[node] = root // path compression
      node = next
    }
    return root
  }

  union(a: number, b: number): boolean {
    let rootA = this.find(a)
    let rootB = this.find(b)
    if (rootA === rootB) return false // already connected: this edge closes a cycle
    if (this.size[rootA] < this.size[rootB]) {
      const temp = rootA
      rootA = rootB
      rootB = temp
    }
    this.parent[rootB] = rootA // hang the smaller tree under the larger
    this.size[rootA] += this.size[rootB]
    return true
  }
}
```

- `union` returning `false` is the signal most problems need: those two nodes were already connected.
- Union by size and path compression together keep each call close to `O(1)`. Drop both and a chain of unions can make `find` linear.
- Labels starting at `1` (as in Redundant Connection) need `new UnionFind(n + 1)`.

### Choosing a template

- Fewest steps, unit cost: **BFS**. Many starting points: the same BFS with all of them seeded.
- Reachability, region size, counting regions: **DFS** or **BFS**, whichever you write fastest.
- An order that respects dependencies, or "can everything finish": **Kahn**. It gives the order and the cycle check in one pass.
- Edges arrive as a list and you only care about connectivity or the first loop: **union-find**. No adjacency list needed.

## Choosing the representation

| Input looks like | Represent it as | Notes |
| --- | --- | --- |
| A grid | nothing extra; neighbours from `DR`/`DC` | encode a cell as `r * cols + c` |
| Edge list over `0..n-1` | `number[][]` adjacency list | `O(V + E)` memory, iterate neighbours directly |
| Adjacency list already given | use it as is | check whether it is symmetric |
| Words or strings | `Map<string, string[]>` from pattern to words | build edges on demand |
| Dense graph, "is `u` linked to `v`" asked often | `boolean[][]` adjacency matrix | `O(V²)` memory, rarely worth it |

The visited marker has choices too:

| Marker | Cost | Use when |
| --- | --- | --- |
| `boolean[]` or `boolean[][]` | `O(V)` | default |
| `dist` array filled with `-1` | `O(V)` | you need distances anyway |
| Overwrite the grid cell | `O(1)` extra | the input may be modified |
| `Set<string>` | `O(V)`, slower hashing | nodes are words, not numbers |

Avoid `Set<string>` with keys like `` `${r},${c}` `` for grid cells. It works, but building a string per neighbour check is far slower than an array lookup.

## Worked problems

**Number of Islands.** Scan every cell. Each time you find land that is not yet marked, you have found a new island: add one, then flood it with DFS or BFS so none of its cells is counted again. The only state is the visited marker. The twist is that the count comes from how many floods you start, not from anything inside a flood.

**Rotting Oranges.** Multi-source BFS, level by level. Seed every rotten orange, count fresh ones up front, and decrement the count as each one rots. The twist is the two special answers: `0` when nothing is fresh at the start (the loop never counts a round), and `-1` when the count is still positive after the queue empties.

**Course Schedule II.** Build edges `b -> a` from each `[a, b]`, then run Kahn. The queue is the schedule. The twist is the cycle check for free: if fewer than `numCourses` courses ever reach indegree `0`, some of them wait on each other forever, so return `[]`.

**Redundant Connection.** Feed edges to union-find in input order. The first edge whose `union` returns `false` joins two nodes that are already connected, so it lies on the only cycle. The twist is the tie-break: the statement wants the last cycle edge in the input, and the first one union-find rejects is exactly that, because every earlier cycle edge was still needed to connect the loop.

## Variations and tricks

- **Search from the answer side.** When many cells each ask "can I reach X", run one search from X instead. Pacific Atlantic floods uphill from each ocean's border; Surrounded Regions marks every `"O"` reachable from the border as safe; Walls and Gates and 01 Matrix seed every gate or zero.
- **Two-colouring.** Give the start colour `0`, each neighbour the opposite colour. A neighbour that already has the **same** colour proves the graph is not bipartite. Restart from every uncoloured node, because the graph may be disconnected.
- **Tree check by counting.** A graph on `n` nodes is a tree exactly when it has `n - 1` edges and is connected. Check the count first; then one traversal or `n - 1` successful unions settles it.
- **Counting components with union-find.** Start with `n` components and subtract one for every `union` that returns `true`.
- **Implicit graphs with buckets.** In Word Ladder, comparing every pair of words is `O(n² · L)`. Instead map each wildcard pattern such as `h*t` to the words that fit it. Two words are neighbours exactly when they share a bucket.
- **Bidirectional BFS.** For one source and one target, grow the smaller of two frontiers each round, from both ends, and stop when they meet. Each search only has to go half as deep, so far fewer nodes are touched. A good follow-up answer for Word Ladder.
- **Remove the bucket once used.** In implicit-graph BFS, clear a bucket after expanding it. Every word in it is already queued, so revisiting it is wasted work.

## Complexity

- BFS and DFS on an adjacency list: `O(V + E)` time, because each node is expanded once and each edge is looked at once from each end. Space `O(V)` for the visited marker and the queue or stack.
- On a grid: `O(rows · cols)` time and space, since each cell has at most 4 edges.
- Kahn and three-colour DFS: `O(V + E)` time, `O(V + E)` space including the adjacency list.
- Union-find with both optimisations: `O(E · α(V))` for `E` unions, where `α` is the inverse Ackermann function, at most 4 for any input you will see.
- Word Ladder with buckets: `O(n · L²)`, because each of `n` words produces `L` patterns of length `L`.

## Pitfalls

- Marking visited on pop instead of on push, so one cell enters the queue several times.
- `queue.shift()` in a loop: `O(n)` per call, so the BFS becomes `O(n²)`.
- Deep recursive DFS on a large grid overflowing the stack.
- Reading the prerequisite pair the wrong way round and building edges backwards.
- Building the adjacency list only for nodes that appear in edges, then missing isolated nodes in the count or the order.
- Two-colour cycle detection on a directed graph, which reports cycles that are not there.
- Treating the parent edge as a cycle in an undirected DFS.
- Counting one round too many in level-by-level BFS, or returning `-1` for Rotting Oranges when nothing was fresh to begin with.
- In Flood Fill, starting when the new colour equals the old one: every cell still "matches", so the fill never stops unless you return early.

## Practice ladder

1. [Flood Fill](/problems/flood-fill): one flood from one cell, and the early exit when the colour already matches.
2. [Number of Islands](/problems/number-of-islands): counting regions by counting how many floods you start.
3. [Max Area of Island](/problems/max-area-of-island): a flood that returns its size.
4. [Rotting Oranges](/problems/rotting-oranges): multi-source BFS, level by level, with a fresh counter.
5. [01 Matrix](/problems/01-matrix): seeding every zero to get every cell's nearest distance in one pass.
6. [Surrounded Regions](/problems/surrounded-regions): flood from the border to find what cannot be captured.
7. [Walls and Gates](/problems/walls-and-gates): multi-source BFS written straight into the grid.
8. [Pacific Atlantic Water Flow](/problems/pacific-atlantic-water-flow): two reverse searches and their overlap.
9. [Course Schedule](/problems/course-schedule): turning prerequisites into a directed graph and finding a cycle.
10. [Course Schedule II](/problems/course-schedule-ii): Kahn's queue as the actual schedule.
11. [Is Graph Bipartite?](/problems/is-graph-bipartite): two-colouring a possibly disconnected graph.
12. [Number of Connected Components in an Undirected Graph](/problems/number-of-connected-components-in-an-undirected-graph): union-find counting down from `n`.
13. [Graph Valid Tree](/problems/graph-valid-tree): the `n - 1` edges rule plus one connectivity check.
14. [Redundant Connection](/problems/redundant-connection): the first rejected union is the cycle edge.
15. [Word Ladder](/problems/word-ladder): BFS over an implicit graph built from wildcard buckets.
