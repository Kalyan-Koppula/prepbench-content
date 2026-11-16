function criticalConnections(n: number, connections: number[][]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [a, b] of connections) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const disc = new Array(n).fill(-1) // discovery time
  const low = new Array(n).fill(0) // earliest discovery time reachable from the subtree
  const bridges: number[][] = []
  let timer = 0

  const dfs = (u: number, parent: number) => {
    disc[u] = low[u] = timer++
    for (const v of adj[u]) {
      if (v === parent) continue
      if (disc[v] === -1) {
        dfs(v, u)
        low[u] = Math.min(low[u], low[v])
        if (low[v] > disc[u]) bridges.push([u, v]) // v's subtree can't get back above u
      } else {
        low[u] = Math.min(low[u], disc[v])
      }
    }
  }
  dfs(0, -1)
  return bridges
}
