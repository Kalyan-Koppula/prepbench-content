function countComponents(n: number, edges: number[][]): number {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const seen = new Array(n).fill(false)
  let count = 0
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    count++
    seen[s] = true
    const stack = [s]
    while (stack.length) {
      const u = stack.pop()!
      for (const v of adj[u]) if (!seen[v]) (seen[v] = true), stack.push(v)
    }
  }
  return count
}
