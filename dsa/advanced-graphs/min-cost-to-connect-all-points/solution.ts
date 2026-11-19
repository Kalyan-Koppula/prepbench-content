function minCostConnectPoints(points: number[][]): number {
  // Prim's algorithm with an array: the graph is complete, so O(n^2) is ideal.
  const n = points.length
  const inTree = new Array(n).fill(false)
  const cheapest = new Array(n).fill(Infinity) // cheapest edge from each point into the tree
  cheapest[0] = 0
  let total = 0
  for (let added = 0; added < n; added++) {
    // Pick the outside point that is cheapest to connect.
    let u = -1
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && (u === -1 || cheapest[i] < cheapest[u])) {
        u = i
      }
    }
    inTree[u] = true
    total += cheapest[u]
    // Connecting u may give other points a cheaper way in.
    for (let v = 0; v < n; v++) {
      if (inTree[v]) {
        continue
      }
      const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1])
      if (d < cheapest[v]) {
        cheapest[v] = d
      }
    }
  }
  return total
}
