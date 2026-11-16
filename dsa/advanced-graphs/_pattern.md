---
title: Advanced Graphs
order: 13
summary: Weighted shortest paths, minimum spanning trees and bridges — pick the algorithm from the edge weights and the question.
---

## Recognise it

- Edges have **costs/times/weights** and you want the cheapest path → Dijkstra (non-negative weights).
- "At most `k` edges/stops", or negative weights → Bellman-Ford (`k + 1` relaxation rounds).
- "Shortest distance between **every** pair", `n` ≤ a few hundred → Floyd–Warshall.
- "Connect everything at minimum total cost" → MST (Prim on dense graphs, Kruskal on sparse edge lists).
- Path cost is the **max** edge on the path (minimise the worst step) → Dijkstra with `max` instead of `+`, or Kruskal/union-find, or binary search + BFS.
- "Which edges, if removed, disconnect the graph?" → Tarjan bridges (discovery time + low-link).

## Which one?

| Algorithm | Use for | Time |
|---|---|---|
| BFS | unit weights | `O(V + E)` |
| Dijkstra (heap) | single source, weights ≥ 0 | `O(E log V)` |
| Bellman-Ford | negative weights, hop limits, detecting negative cycles | `O(V · E)` |
| Floyd–Warshall | all pairs, small `V` | `O(V³)` |
| Prim (array) | MST, dense / complete graphs | `O(V²)` |
| Kruskal | MST, sparse edge list | `O(E log E)` |
| Tarjan | bridges, articulation points | `O(V + E)` |

## Templates

```ts
// Dijkstra with lazy deletion
const dist = new Array(n).fill(Infinity)
dist[src] = 0
const pq = new PriorityQueue<number[]>((a, b) => a[0] - b[0]) // [dist, node]
pq.push([0, src])
while (!pq.isEmpty()) {
  const [d, u] = pq.pop()!
  if (d > dist[u]) continue // stale entry
  for (const [v, w] of adj[u]) {
    if (d + w < dist[v]) { dist[v] = d + w; pq.push([dist[v], v]) }
  }
}

// Bellman-Ford limited to k + 1 edges: relax from a snapshot each round
let dist = new Array(n).fill(Infinity); dist[src] = 0
for (let round = 0; round <= k; round++) {
  const next = dist.slice()
  for (const [u, v, w] of edges) if (dist[u] + w < next[v]) next[v] = dist[u] + w
  dist = next
}

// Floyd–Warshall: k must be the OUTER loop
for (let k = 0; k < n; k++)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])

// Tarjan bridges: edge (u, v) is a bridge if low[v] > disc[u]
```

## Interview notes

- `PriorityQueue` is a global here; in a real interview, say you'd use a library heap or offer to write one.
- Lazy deletion (skip stale heap entries) is simpler than decrease-key and has the same bound.
- Dijkstra is wrong with negative edges — a settled node can later get cheaper.
- Prim ≈ Dijkstra where the key is the single edge weight, not the path length.
- Kruskal = sort edges + union-find; stop after `V - 1` successful unions.
- Eulerian path (use every edge once) → Hierholzer's algorithm, not BFS/DFS over nodes.

## Pitfalls

- Bellman-Ford with a hop limit must relax from the **previous round's** distances, or one round can chain several edges.
- Floyd–Warshall with the intermediate `k` loop inside gives wrong answers.
- Using `Infinity + w` is fine in JS, but `Number.MAX_SAFE_INTEGER + w` silently loses precision.
- Return `-1`/`Infinity` conventions: read what the problem wants for unreachable targets.
