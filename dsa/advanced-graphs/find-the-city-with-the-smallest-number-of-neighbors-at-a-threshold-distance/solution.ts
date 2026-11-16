function findTheCity(n: number, edges: number[][], distanceThreshold: number): number {
  const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (const [u, v, w] of edges) {
    dist[u][v] = w
    dist[v][u] = w
  }
  // Floyd–Warshall: allow cities 0..k as intermediate stops.
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j]

  let bestCity = -1
  let bestCount = Infinity
  for (let i = 0; i < n; i++) {
    let count = 0
    for (let j = 0; j < n; j++) if (j !== i && dist[i][j] <= distanceThreshold) count++
    if (count <= bestCount) {
      bestCount = count
      bestCity = i // `<=` lets a later (larger) label win ties
    }
  }
  return bestCity
}
