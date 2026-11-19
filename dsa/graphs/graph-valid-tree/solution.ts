function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}

function validTree(n: number, edges: number[][]): boolean {
  // A tree on n nodes has exactly n - 1 edges.
  if (edges.length !== n - 1) {
    return false
  }
  const parent: number[] = []
  for (let i = 0; i < n; i++) {
    parent.push(i)
  }
  for (let i = 0; i < edges.length; i++) {
    const a = findRoot(parent, edges[i][0])
    const b = findRoot(parent, edges[i][1])
    if (a === b) {
      return false // this edge joins two already-connected nodes: a cycle
    }
    parent[a] = b
  }
  // n - 1 edges and no cycle means the graph is connected.
  return true
}
