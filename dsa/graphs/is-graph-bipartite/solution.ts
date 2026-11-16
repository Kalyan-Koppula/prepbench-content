function isBipartite(graph: number[][]): boolean {
  const n = graph.length
  const color = new Array(n).fill(-1)
  for (let start = 0; start < n; start++) {
    if (color[start] !== -1) continue
    color[start] = 0
    const queue = [start]
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head]
      for (const v of graph[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u]
          queue.push(v)
        } else if (color[v] === color[u]) {
          return false
        }
      }
    }
  }
  return true
}
