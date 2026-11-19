function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}

function findRedundantConnection(edges: number[][]): number[] {
  const parent: number[] = []
  for (let i = 0; i <= edges.length; i++) {
    parent.push(i) // nodes are labelled 1..n
  }
  for (let i = 0; i < edges.length; i++) {
    const a = findRoot(parent, edges[i][0])
    const b = findRoot(parent, edges[i][1])
    if (a === b) {
      // Both ends are already connected, so this edge closes the cycle.
      // It is the last edge of the cycle in input order.
      return edges[i]
    }
    parent[a] = b
  }
  return []
}
