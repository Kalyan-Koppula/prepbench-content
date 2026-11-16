function minCostConnectPoints(points: number[][]): number {
  // Kruskal: sort every pairwise edge, add it if it joins two components.
  const n = points.length
  const edges: number[][] = []
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      edges.push([Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), i, j])
  edges.sort((a, b) => a[0] - b[0])
  const parent = points.map((_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  let total = 0
  for (const [w, i, j] of edges) {
    const a = find(i)
    const b = find(j)
    if (a !== b) {
      parent[a] = b
      total += w
    }
  }
  return total
}
