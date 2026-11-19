function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}

function minCostConnectPoints(points: number[][]): number {
  // Kruskal: sort all n^2 / 2 edges, add each one that joins two components.
  // O(n^2 log n) time and O(n^2) memory for the edge list.
  const n = points.length
  const from: number[] = []
  const to: number[] = []
  const cost: number[] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      from.push(i)
      to.push(j)
      cost.push(Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]))
    }
  }
  const order: number[] = []
  for (let e = 0; e < cost.length; e++) {
    order.push(e)
  }
  order.sort((a, b) => cost[a] - cost[b])
  const parent: number[] = []
  for (let i = 0; i < n; i++) {
    parent.push(i)
  }
  let total = 0
  let used = 0
  for (let k = 0; k < order.length && used < n - 1; k++) {
    const e = order[k]
    const a = findRoot(parent, from[e])
    const b = findRoot(parent, to[e])
    if (a !== b) {
      parent[a] = b
      total += cost[e]
      used++
    }
  }
  return total
}
