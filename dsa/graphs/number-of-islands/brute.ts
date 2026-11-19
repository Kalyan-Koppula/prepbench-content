function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]] // path halving
    x = parent[x]
  }
  return x
}

function numIslands(grid: string[][]): number {
  // Union-find: start with every land cell as its own island, merge neighbours.
  const rows = grid.length
  const cols = grid[0].length
  const parent: number[] = []
  for (let i = 0; i < rows * cols; i++) {
    parent.push(i)
  }
  let islands = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        islands++
      }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') {
        continue
      }
      // Only look right and down; left and up were handled from the other side.
      if (c + 1 < cols && grid[r][c + 1] === '1') {
        const a = findRoot(parent, r * cols + c)
        const b = findRoot(parent, r * cols + c + 1)
        if (a !== b) {
          parent[a] = b
          islands--
        }
      }
      if (r + 1 < rows && grid[r + 1][c] === '1') {
        const a = findRoot(parent, r * cols + c)
        const b = findRoot(parent, (r + 1) * cols + c)
        if (a !== b) {
          parent[a] = b
          islands--
        }
      }
    }
  }
  return islands
}
