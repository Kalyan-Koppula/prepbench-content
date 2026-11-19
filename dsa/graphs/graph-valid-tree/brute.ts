function validTree(n: number, edges: number[][]): boolean {
  // DFS from node 0: no cycle (never reach a visited node except the parent)
  // and every node reached.
  const adj: number[][] = []
  for (let i = 0; i < n; i++) {
    adj.push([])
  }
  for (let i = 0; i < edges.length; i++) {
    adj[edges[i][0]].push(edges[i][1])
    adj[edges[i][1]].push(edges[i][0])
  }
  const visited = new Array(n).fill(false)
  const from = new Array(n).fill(-1)
  visited[0] = true
  const stack: number[] = [0]
  let seen = 1
  while (stack.length > 0) {
    const u = stack.pop() as number
    for (let j = 0; j < adj[u].length; j++) {
      const v = adj[u][j]
      if (v === from[u]) {
        continue // the edge we came along
      }
      if (visited[v]) {
        return false // a second way to reach v: a cycle
      }
      visited[v] = true
      from[v] = u
      seen++
      stack.push(v)
    }
  }
  return seen === n
}
