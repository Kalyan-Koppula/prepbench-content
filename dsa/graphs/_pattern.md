---
title: Graphs
order: 12
summary: Grids and adjacency lists are graphs — BFS for distances, DFS for reachability, Kahn for ordering, union-find for connectivity.
---

## Recognise it

- A grid where cells "spread", "connect" or "flow" to their 4 neighbours.
- Pairs/edges/prerequisites/dependencies between items numbered `0..n-1`.
- "Minimum number of steps/moves" with unit-cost moves → BFS.
- "Is there an order that satisfies all dependencies?" → topological sort / cycle detection.
- "Are these connected?", "how many groups?", "which edge closes a cycle?" → union-find.

## Templates

```ts
// Grid BFS (multi-source: seed the queue with every source at distance 0)
const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const queue: number[][] = [...sources]
for (let head = 0; head < queue.length; head++) {
  const [r, c] = queue[head]
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc
    if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc]) continue
    seen[nr][nc] = true // mark when pushing, not when popping
    queue.push([nr, nc])
  }
}

// Kahn's algorithm
const indegree = new Array(n).fill(0)
for (const [to, from] of edges) { adj[from].push(to); indegree[to]++ }
const order: number[] = []
const ready = [...indegree.keys()].filter((v) => indegree[v] === 0)
while (ready.length) {
  const v = ready.pop()!
  order.push(v)
  for (const w of adj[v]) if (--indegree[w] === 0) ready.push(w)
}
// order.length < n  ⇔  there is a cycle

// Union-find with path compression + union by size
const parent = [...Array(n).keys()], size = new Array(n).fill(1)
const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
const union = (a: number, b: number) => {
  let ra = find(a), rb = find(b)
  if (ra === rb) return false
  if (size[ra] < size[rb]) [ra, rb] = [rb, ra]
  parent[rb] = ra; size[ra] += size[rb]
  return true
}
```

## Interview notes

- Say what the nodes and edges are before coding: "each cell is a node, edges go to the 4 neighbours".
- BFS gives shortest paths only when every edge costs the same. Weighted → Dijkstra (see Advanced Graphs).
- Multi-source BFS = one BFS with all sources enqueued at distance 0; never run one BFS per source.
- Process BFS level by level (`for (let k = queue.length; k > 0; k--)`) when you need "minutes" or "steps".
- Reverse the question when it helps: flood from the border/ocean/gates inward instead of from every cell outward.
- Directed cycle detection: Kahn's (count processed nodes) or DFS with three colours (white/grey/black).
- Undirected cycle detection: union-find (an edge inside one set closes a cycle) or DFS that ignores the parent edge.
- A graph on `n` nodes is a tree ⇔ it has `n - 1` edges and is connected.
- Mutating the grid as your visited set is fine if you say so; ask whether the input may be modified.

## Pitfalls

- Marking visited on pop instead of on push lets a cell enter the queue many times.
- `queue.shift()` is O(n) in JS; use a head index on an array.
- Recursive DFS on a 300×300 grid can hit the stack limit; mention the iterative version.
- Forgetting isolated nodes: iterate over all `0..n-1`, not just nodes that appear in edges.
- Edge direction in prerequisites: `[a, b]` usually means "b before a" — read it twice.
