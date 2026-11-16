function validTree(n: number, edges: number[][]): boolean {
  if (edges.length !== n - 1) return false
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  for (const [a, b] of edges) {
    const ra = find(a)
    const rb = find(b)
    if (ra === rb) return false // this edge closes a cycle
    parent[ra] = rb
  }
  // n - 1 edges and no cycle ⇒ connected.
  return true
}
