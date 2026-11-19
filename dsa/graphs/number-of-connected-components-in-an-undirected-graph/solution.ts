function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]] // path halving keeps the trees shallow
    x = parent[x]
  }
  return x
}

function countComponents(n: number, edges: number[][]): number {
  // Union-find: start with n separate components; each merging edge removes one.
  const parent: number[] = []
  const size: number[] = []
  for (let i = 0; i < n; i++) {
    parent.push(i)
    size.push(1)
  }
  let components = n
  for (let i = 0; i < edges.length; i++) {
    let a = findRoot(parent, edges[i][0])
    let b = findRoot(parent, edges[i][1])
    if (a === b) {
      continue // already connected
    }
    if (size[a] < size[b]) {
      const temp = a // attach the smaller tree under the larger one
      a = b
      b = temp
    }
    parent[b] = a
    size[a] += size[b]
    components--
  }
  return components
}
