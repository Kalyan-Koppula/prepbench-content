---
title: Advanced Graphs
order: 13
summary: Weighted shortest paths, minimum spanning trees, union-find, topological order and bridges — the graph tools beyond plain BFS and DFS.
---

## The idea

Plain BFS finds shortest paths when every edge costs the same. Many problems don't have that luxury: flights have prices, roads have lengths, a path's cost is the largest step instead of the sum. This sheet collects the algorithms that handle those cases. They all build on the traversals from [Graphs](/problems/patterns/graphs); what changes is **which node to process next** and **what you store per node**.

| Question | Tool | Core idea |
| --- | --- | --- |
| Cheapest path from one source, non-negative weights | **Dijkstra** | Always expand the closest unfinished node (min-heap) |
| Cheapest path with at most `k` edges, or negative weights | **Bellman-Ford** | Relax every edge, `k` (or `V − 1`) rounds |
| Cheapest path between every pair, small `V` | **Floyd-Warshall** | Allow intermediate nodes one at a time |
| Connect all nodes as cheaply as possible | **Minimum spanning tree** (Prim, Kruskal) | Grow by the cheapest edge that adds something new |
| Merge groups, detect cycles as edges arrive | **Union-find** | Each group has a representative |
| Order with dependencies | **Topological sort** | Take nodes with no remaining incoming edges |
| Edges whose removal disconnects the graph | **Bridges** (Tarjan) | DFS discovery times and low-links |

## When to reach for it

- Edge **weights** and "minimum cost / time / effort": Dijkstra (or a variant).
- "At most `k` stops/edges": Bellman-Ford limited to `k + 1` rounds, or Dijkstra over `(node, stops)` states.
- "Minimise the **maximum** edge on the path" (a bottleneck): Dijkstra with `max` instead of `+`, or binary search on the answer with BFS.
- "Connect everything at minimum total cost": minimum spanning tree.
- "Group items that share something" (accounts with a common email): union-find.
- An order is implied by comparisons (alien alphabet, build steps): topological sort.
- "Which connections are critical?": bridges.

## How it works: Dijkstra

Dijkstra keeps a tentative distance for every node and a min-heap of `(distance, node)` candidates. It repeatedly takes the closest candidate. Because all weights are non-negative, nothing found later can be cheaper than what is closest now, so that distance is **final**. Then it tries to improve each neighbour ("relaxation").

```
      A --1-- B
      |       |
      4       2
      |       |
      C --1-- D
```

From `A`:

| pop (dist, node) | final? | relax | heap after |
| --- | --- | --- | --- |
| (0, A) | A = 0 | B: 1, C: 4 | (1, B), (4, C) |
| (1, B) | B = 1 | D: 1 + 2 = 3 | (3, D), (4, C) |
| (3, D) | D = 3 | C: 3 + 1 = 4 (no better) | (4, C) |
| (4, C) | C = 4 | – | empty |

The **invariant**: when a node is popped for the first time, its distance is the shortest possible. Later, stale entries for the same node are skipped.

## Templates

### Dijkstra with a min-heap

```ts
function dijkstra(n: number, adj: number[][][], source: number): number[] {
  // adj[u] is a list of [v, weight] pairs.
  const dist = new Array(n).fill(Infinity)
  dist[source] = 0
  const heap = new PriorityQueue<number[]>((a, b) => a[0] - b[0]) // [distance, node]
  heap.push([0, source])
  while (!heap.isEmpty()) {
    const top = heap.pop() as number[]
    const d = top[0]
    const u = top[1]
    if (d > dist[u]) {
      continue // a stale entry: u was already finalised with a smaller distance
    }
    for (let i = 0; i < adj[u].length; i++) {
      const v = adj[u][i][0]
      const w = adj[u][i][1]
      if (d + w < dist[v]) {
        dist[v] = d + w
        heap.push([dist[v], v])
      }
    }
  }
  return dist
}
```

- Skip stale heap entries instead of trying to decrease keys.
- For a bottleneck cost ("effort"), replace `d + w` with `max(d, w)`.

### Bellman-Ford with at most k edges

```ts
function cheapestWithin(n: number, edges: number[][], source: number, target: number, maxEdges: number): number {
  let dist = new Array(n).fill(Infinity)
  dist[source] = 0
  for (let round = 0; round < maxEdges; round++) {
    const next = dist.slice() // relax from last round's values only
    for (let i = 0; i < edges.length; i++) {
      const u = edges[i][0]
      const v = edges[i][1]
      const w = edges[i][2]
      if (dist[u] + w < next[v]) {
        next[v] = dist[u] + w
      }
    }
    dist = next
  }
  return dist[target] === Infinity ? -1 : dist[target]
}
```

- Copying the array each round is what limits paths to `round` edges.

### Union-find

```ts
function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]] // path halving
    x = parent[x]
  }
  return x
}
// union: a = findRoot(a), b = findRoot(b); if a !== b, attach the smaller tree under the larger.
```

### Kruskal's minimum spanning tree

Sort edges by weight; add each edge whose endpoints are in different union-find sets. Stop after `V − 1` edges.

### Topological sort (Kahn)

Count incoming edges; start from nodes with none; removing a node decrements its successors; a successor reaching zero is ready. If not every node is taken, there is a cycle.

### Choosing a template

- Non-negative weights, one source: **Dijkstra**.
- A limit on the number of edges, or negative weights: **Bellman-Ford**.
- All pairs, `V ≤ ~400`: **Floyd-Warshall**, `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])` for each `k`.
- Connect all at minimum cost: **Kruskal** (edge list) or **Prim** (dense graph, heap of edges from the tree).
- Grouping and merging: **union-find**.

## Choosing the state

| Problem | Node state | Cost combination |
| --- | --- | --- |
| Network Delay Time | node | sum |
| Path With Minimum Effort | cell | max of step differences |
| Swim in Rising Water | cell | max of heights |
| Cheapest Flights Within K Stops | node (per round) | sum, with an edge limit |
| Shortest Path in Binary Matrix | cell | +1 per step (plain BFS) |

When a constraint like "at most `k` stops" matters, either add it to the state (`(node, stops)`) or process in rounds.

## Worked problems

**Network Delay Time.** Dijkstra from the source; the answer is the largest final distance, or −1 if some node is unreachable.

**Path With Minimum Effort.** Dijkstra where a path's cost is the largest height difference along it, so relaxation uses `max(current effort, step difference)`.

**Min Cost to Connect All Points.** A complete graph with Manhattan distances. Prim's algorithm with a simple array of "cheapest connection to the tree so far" runs in `O(n²)`, ideal for dense graphs.

**Critical Connections.** One DFS records discovery times and, for each node, the earliest discovery time reachable from its subtree using at most one back edge (its low-link). An edge to a child is a bridge when the child can't reach above the parent.

## Variations and tricks

- **0-1 BFS:** weights of 0 or 1 only; use a deque, adding 0-weight neighbours to the front.
- **Multi-source Dijkstra:** start with several sources at distance 0.
- **Binary search on the answer plus BFS** for bottleneck questions, as an alternative to modified Dijkstra.
- **Hierholzer's algorithm** for using every edge exactly once (Reconstruct Itinerary): DFS and add nodes to the path when they run out of edges, then reverse.
- **Union-find with a map** when the items are strings (emails) instead of indices.

## Complexity

- Dijkstra with a binary heap: `O((V + E) log V)`.
- Bellman-Ford: `O(k · E)` for `k` rounds, `O(V · E)` in general.
- Floyd-Warshall: `O(V³)` time, `O(V²)` space.
- Kruskal: `O(E log E)`; Prim with a heap `O(E log V)`, Prim with an array `O(V²)`.
- Union-find: near `O(1)` per operation (inverse Ackermann).
- Topological sort and bridges: `O(V + E)`.

## Pitfalls

- Dijkstra with negative weights, which can finalise a node too early.
- Not skipping stale heap entries, so nodes are processed many times.
- Bellman-Ford with a limit on edges but relaxing in place, which lets a path use more edges than allowed in one round.
- Forgetting unreachable nodes (distance still infinite).
- Recursion depth in DFS-based algorithms on large graphs.

## Practice ladder

1. [Network Delay Time](/problems/network-delay-time): Dijkstra from one source.
2. [Path With Minimum Effort](/problems/path-with-minimum-effort): Dijkstra with a bottleneck (max) cost.
3. [Shortest Path in Binary Matrix](/problems/shortest-path-in-binary-matrix): BFS with eight directions, unit weights.
4. [Cheapest Flights Within K Stops](/problems/cheapest-flights-within-k-stops): Bellman-Ford limited by rounds.
5. [Min Cost to Connect All Points](/problems/min-cost-to-connect-all-points): minimum spanning tree with Prim.
6. [Find the City With the Smallest Number of Neighbors](/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance): all-pairs shortest paths with Floyd-Warshall.
7. [Accounts Merge](/problems/accounts-merge): union-find over strings.
8. [Reconstruct Itinerary](/problems/reconstruct-itinerary): an Eulerian path with Hierholzer's algorithm.
9. [Swim in Rising Water](/problems/swim-in-rising-water): minimising the maximum along a path.
10. [Alien Dictionary](/problems/alien-dictionary): building a graph from comparisons, then topological sort.
11. [Critical Connections in a Network](/problems/critical-connections-in-a-network): bridges with discovery times and low-links.
