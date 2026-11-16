function criticalConnections(n: number, connections: number[][]): number[][] {
  const result: number[][] = []
  connections.forEach((edge, skip) => {
    const adj: number[][] = Array.from({ length: n }, () => [])
    connections.forEach(([a, b], i) => {
      if (i !== skip) adj[a].push(b), adj[b].push(a)
    })
    const seen = new Array(n).fill(false)
    seen[0] = true
    const stack = [0]
    let count = 1
    while (stack.length) for (const v of adj[stack.pop()!]) if (!seen[v]) (seen[v] = true), count++, stack.push(v)
    if (count < n) result.push(edge)
  })
  return result
}
