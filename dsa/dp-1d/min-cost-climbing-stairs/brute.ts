function minCostClimbingStairs(cost: number[]): number {
  // Shortest path by repeated relaxation (Bellman-Ford): positions are nodes,
  // paying step i's fee lets you move to i + 1 or i + 2. O(n^2).
  const n = cost.length
  const dist = new Array(n + 1).fill(Infinity)
  dist[0] = 0
  dist[1] = 0
  for (let round = 0; round <= n; round++) {
    for (let i = 0; i < n; i++) {
      for (let step = 1; step <= 2; step++) {
        if (i + step <= n && dist[i] + cost[i] < dist[i + step]) {
          dist[i + step] = dist[i] + cost[i]
        }
      }
    }
  }
  return dist[n]
}
