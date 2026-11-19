function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}

function isBipartite(graph: number[][]): boolean {
  // Union-find: all neighbours of u must end up on one side together,
  // and u must never share a set with any of them.
  const n = graph.length
  const parent: number[] = []
  for (let i = 0; i < n; i++) {
    parent.push(i)
  }
  for (let u = 0; u < n; u++) {
    for (let j = 0; j < graph[u].length; j++) {
      const v = graph[u][j]
      if (findRoot(parent, u) === findRoot(parent, v)) {
        return false
      }
      const a = findRoot(parent, graph[u][0])
      const b = findRoot(parent, v)
      if (a !== b) {
        parent[b] = a
      }
    }
  }
  return true
}
