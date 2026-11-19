function isBipartite(graph: number[][]): boolean {
  const n = graph.length
  const side = new Array(n).fill(-1) // -1 = not coloured yet, otherwise 0 or 1
  // The graph may be disconnected, so start a BFS from every uncoloured node.
  for (let start = 0; start < n; start++) {
    if (side[start] !== -1) {
      continue
    }
    side[start] = 0
    const queue: number[] = [start]
    let head = 0
    while (head < queue.length) {
      const u = queue[head]
      head++
      for (let j = 0; j < graph[u].length; j++) {
        const v = graph[u][j]
        if (side[v] === -1) {
          side[v] = 1 - side[u] // neighbours go on the other side
          queue.push(v)
        } else if (side[v] === side[u]) {
          return false // an edge inside one side: an odd cycle
        }
      }
    }
  }
  return true
}
