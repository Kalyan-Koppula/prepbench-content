function countComponents(n: number, edges: number[][]): number {
  // Adjacency lists plus DFS from every unvisited node.
  const adj: number[][] = []
  for (let i = 0; i < n; i++) {
    adj.push([])
  }
  for (let i = 0; i < edges.length; i++) {
    adj[edges[i][0]].push(edges[i][1])
    adj[edges[i][1]].push(edges[i][0])
  }
  const visited = new Array(n).fill(false)
  let components = 0
  for (let start = 0; start < n; start++) {
    if (visited[start]) {
      continue
    }
    components++
    visited[start] = true
    const stack: number[] = [start]
    while (stack.length > 0) {
      const u = stack.pop() as number
      for (let j = 0; j < adj[u].length; j++) {
        const v = adj[u][j]
        if (!visited[v]) {
          visited[v] = true
          stack.push(v)
        }
      }
    }
  }
  return components
}
