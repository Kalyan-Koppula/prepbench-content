function validTree(n: number, edges: number[][]): boolean {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const parentOf = new Array(n).fill(-2) // -2 = unvisited
  parentOf[0] = -1
  const stack = [0]
  let visited = 1
  while (stack.length) {
    const u = stack.pop()!
    for (const v of adj[u]) {
      if (v === parentOf[u]) continue
      if (parentOf[v] !== -2) return false // reached an already-visited node another way
      parentOf[v] = u
      visited++
      stack.push(v)
    }
  }
  return visited === n
}
