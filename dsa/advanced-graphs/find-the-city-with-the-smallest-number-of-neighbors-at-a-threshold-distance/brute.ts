function findTheCity(n: number, edges: number[][], distanceThreshold: number): number {
  const counts: number[] = []
  for (let s = 0; s < n; s++) {
    // Bellman-Ford from s over the undirected roads.
    const dist = new Array(n).fill(Infinity)
    dist[s] = 0
    let changed = true
    while (changed) {
      changed = false
      for (const [u, v, w] of edges) {
        if (dist[u] + w < dist[v]) (dist[v] = dist[u] + w), (changed = true)
        if (dist[v] + w < dist[u]) (dist[u] = dist[v] + w), (changed = true)
      }
    }
    counts.push(dist.filter((d, j) => j !== s && d <= distanceThreshold).length)
  }
  const min = Math.min(...counts)
  return counts.lastIndexOf(min)
}
