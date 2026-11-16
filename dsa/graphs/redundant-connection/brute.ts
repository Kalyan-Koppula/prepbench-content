function findRedundantConnection(edges: number[][]): number[] {
  const n = edges.length
  const connectedWithout = (skip: number) => {
    const adj: number[][] = Array.from({ length: n + 1 }, () => [])
    edges.forEach(([a, b], i) => {
      if (i === skip) return
      adj[a].push(b)
      adj[b].push(a)
    })
    const seen = new Array(n + 1).fill(false)
    seen[1] = true
    const stack = [1]
    let count = 1
    while (stack.length) for (const v of adj[stack.pop()!]) if (!seen[v]) (seen[v] = true), count++, stack.push(v)
    return count === n
  }
  // n - 1 edges that connect n nodes form a tree.
  for (let i = n - 1; i >= 0; i--) if (connectedWithout(i)) return edges[i]
  return []
}
