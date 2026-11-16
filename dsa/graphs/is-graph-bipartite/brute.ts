function isBipartite(graph: number[][]): boolean {
  // All neighbours of u must land on the same side, opposite to u.
  const parent = graph.map((_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]]
    return x
  }
  for (let u = 0; u < graph.length; u++) {
    for (const v of graph[u]) {
      if (find(u) === find(v)) return false
      parent[find(v)] = find(graph[u][0])
    }
  }
  return true
}
