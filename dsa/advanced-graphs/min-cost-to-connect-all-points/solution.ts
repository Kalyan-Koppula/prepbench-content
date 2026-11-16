function minCostConnectPoints(points: number[][]): number {
  const n = points.length
  const inTree = new Array(n).fill(false)
  const minDist = new Array(n).fill(Infinity) // cheapest edge from each point into the tree
  minDist[0] = 0
  let total = 0
  for (let added = 0; added < n; added++) {
    let u = -1
    for (let i = 0; i < n; i++) if (!inTree[i] && (u === -1 || minDist[i] < minDist[u])) u = i
    inTree[u] = true
    total += minDist[u]
    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue
      const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1])
      if (d < minDist[v]) minDist[v] = d
    }
  }
  return total
}
