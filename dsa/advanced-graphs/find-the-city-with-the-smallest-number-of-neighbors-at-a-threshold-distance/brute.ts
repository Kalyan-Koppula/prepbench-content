function findTheCity(n: number, edges: number[][], distanceThreshold: number): number {
  // Bellman-Ford from every city: O(n^2 * E).
  let bestCity = -1
  let bestCount = Infinity
  for (let s = 0; s < n; s++) {
    const dist = new Array(n).fill(Infinity)
    dist[s] = 0
    for (let round = 1; round < n; round++) {
      let changed = false
      for (let e = 0; e < edges.length; e++) {
        const u = edges[e][0]
        const v = edges[e][1]
        const w = edges[e][2]
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w
          changed = true
        }
        if (dist[v] + w < dist[u]) {
          dist[u] = dist[v] + w
          changed = true
        }
      }
      if (!changed) {
        break
      }
    }
    let count = 0
    for (let j = 0; j < n; j++) {
      if (j !== s && dist[j] <= distanceThreshold) {
        count++
      }
    }
    if (count <= bestCount) {
      bestCount = count
      bestCity = s
    }
  }
  return bestCity
}
