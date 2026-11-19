function criticalConnections(n: number, connections: number[][]): number[][] {
  // Remove each connection in turn and check whether the network stays connected.
  // O(E * (V + E)).
  const result: number[][] = []
  for (let skip = 0; skip < connections.length; skip++) {
    const adj: number[][] = []
    for (let i = 0; i < n; i++) {
      adj.push([])
    }
    for (let i = 0; i < connections.length; i++) {
      if (i !== skip) {
        adj[connections[i][0]].push(connections[i][1])
        adj[connections[i][1]].push(connections[i][0])
      }
    }
    const seen = new Array(n).fill(false)
    seen[0] = true
    const stack: number[] = [0]
    let count = 1
    while (stack.length > 0) {
      const u = stack.pop() as number
      for (let j = 0; j < adj[u].length; j++) {
        if (!seen[adj[u][j]]) {
          seen[adj[u][j]] = true
          count++
          stack.push(adj[u][j])
        }
      }
    }
    if (count < n) {
      result.push(connections[skip])
    }
  }
  return result
}
