function findRedundantConnection(edges: number[][]): number[] {
  // Try removing each edge, from the last one backwards, and check whether the
  // remaining edges still connect everything (then they form a tree). O(n^2).
  const n = edges.length
  for (let skip = n - 1; skip >= 0; skip--) {
    const adj: number[][] = []
    for (let i = 0; i <= n; i++) {
      adj.push([])
    }
    for (let i = 0; i < n; i++) {
      if (i !== skip) {
        adj[edges[i][0]].push(edges[i][1])
        adj[edges[i][1]].push(edges[i][0])
      }
    }
    const visited = new Array(n + 1).fill(false)
    visited[1] = true
    const stack: number[] = [1]
    let seen = 1
    while (stack.length > 0) {
      const u = stack.pop() as number
      for (let j = 0; j < adj[u].length; j++) {
        if (!visited[adj[u][j]]) {
          visited[adj[u][j]] = true
          seen++
          stack.push(adj[u][j])
        }
      }
    }
    if (seen === n) {
      return edges[skip]
    }
  }
  return []
}
