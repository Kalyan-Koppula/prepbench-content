// Bellman-Ford shortest path: positions are nodes, a paid step is an edge.
function minCostClimbingStairs(cost: number[]): number {
  const n = cost.length
  const dist = new Array(n + 1).fill(Infinity)
  dist[0] = 0
  dist[1] = 0
  for (let round = 0; round <= n; round++)
    for (let i = 0; i < n; i++)
      for (const step of [1, 2])
        if (i + step <= n) dist[i + step] = Math.min(dist[i + step], dist[i] + cost[i])
  return dist[n]
}
