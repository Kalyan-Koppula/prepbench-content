function criticalConnections(n: number, connections: number[][]): number[][] {
  const adj: number[][] = []
  for (let i = 0; i < n; i++) {
    adj.push([])
  }
  for (let i = 0; i < connections.length; i++) {
    adj[connections[i][0]].push(connections[i][1])
    adj[connections[i][1]].push(connections[i][0])
  }
  // Tarjan's bridges: disc = DFS discovery time; low = earliest discovery time
  // reachable from the node's subtree using one edge that isn't a tree edge.
  const disc = new Array(n).fill(-1)
  const low = new Array(n).fill(0)
  const bridges: number[][] = []
  const timer = [0]

  function visit(u: number, parent: number): void {
    disc[u] = timer[0]
    low[u] = timer[0]
    timer[0]++
    for (let i = 0; i < adj[u].length; i++) {
      const v = adj[u][i]
      if (v === parent) {
        continue // don't use the tree edge we arrived on
      }
      if (disc[v] === -1) {
        visit(v, u)
        if (low[v] < low[u]) {
          low[u] = low[v]
        }
        if (low[v] > disc[u]) {
          bridges.push([u, v]) // v's subtree can't reach u or above without this edge
        }
      } else if (disc[v] < low[u]) {
        low[u] = disc[v] // a back edge to an ancestor
      }
    }
  }

  visit(0, -1)
  return bridges
}
