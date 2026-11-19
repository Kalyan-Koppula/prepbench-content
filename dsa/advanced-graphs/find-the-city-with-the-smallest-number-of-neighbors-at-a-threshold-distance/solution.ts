function findTheCity(n: number, edges: number[][], distanceThreshold: number): number {
  // dist[i][j]: shortest known distance between cities i and j.
  const dist: number[][] = []
  for (let i = 0; i < n; i++) {
    const row = new Array(n).fill(Infinity)
    row[i] = 0
    dist.push(row)
  }
  for (let e = 0; e < edges.length; e++) {
    const u = edges[e][0]
    const v = edges[e][1]
    const w = edges[e][2]
    dist[u][v] = w
    dist[v][u] = w
  }
  // Floyd-Warshall: after step k, paths may pass through cities 0..k.
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j]
        }
      }
    }
  }
  let bestCity = -1
  let bestCount = Infinity
  for (let i = 0; i < n; i++) {
    let count = 0
    for (let j = 0; j < n; j++) {
      if (j !== i && dist[i][j] <= distanceThreshold) {
        count++
      }
    }
    if (count <= bestCount) {
      // <= lets a later (larger) label win ties.
      bestCount = count
      bestCity = i
    }
  }
  return bestCity
}
