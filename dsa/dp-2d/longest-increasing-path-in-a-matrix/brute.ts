// Kahn's topological sort: repeatedly peel off cells with no smaller neighbour.
// The number of layers peeled equals the longest increasing path.
function longestIncreasingPath(matrix: number[][]): number {
  const m = matrix.length
  const n = matrix[0].length
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const inside = (r: number, c: number) => r >= 0 && r < m && c >= 0 && c < n
  const indeg = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      for (const [dr, dc] of dirs) if (inside(r + dr, c + dc) && matrix[r + dr][c + dc] < matrix[r][c]) indeg[r][c]++
  let layer: [number, number][] = []
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (indeg[r][c] === 0) layer.push([r, c])
  let layers = 0
  while (layer.length) {
    layers++
    const next: [number, number][] = []
    for (const [r, c] of layer)
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (inside(nr, nc) && matrix[nr][nc] > matrix[r][c] && --indeg[nr][nc] === 0) next.push([nr, nc])
      }
    layer = next
  }
  return layers
}
