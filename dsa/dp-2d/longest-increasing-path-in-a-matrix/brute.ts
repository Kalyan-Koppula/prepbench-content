// Topological layers (Kahn's algorithm): peel off cells with no smaller
// neighbour, then the cells that become free, and so on.
// The number of layers equals the longest increasing path.
function longestIncreasingPath(matrix: number[][]): number {
  const m = matrix.length
  const n = matrix[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  // smaller[r * n + c] = how many neighbours of (r, c) are smaller than it.
  const smaller = new Array(m * n).fill(0)
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      for (let d = 0; d < 4; d++) {
        const nr = r + dr[d]
        const nc = c + dc[d]
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] < matrix[r][c]) {
          smaller[r * n + c]++
        }
      }
    }
  }
  let layer: number[] = []
  for (let cell = 0; cell < m * n; cell++) {
    if (smaller[cell] === 0) {
      layer.push(cell)
    }
  }
  let layers = 0
  while (layer.length > 0) {
    layers++
    const next: number[] = []
    for (let k = 0; k < layer.length; k++) {
      const r = Math.floor(layer[k] / n)
      const c = layer[k] % n
      for (let d = 0; d < 4; d++) {
        const nr = r + dr[d]
        const nc = c + dc[d]
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {
          smaller[nr * n + nc]--
          if (smaller[nr * n + nc] === 0) {
            next.push(nr * n + nc)
          }
        }
      }
    }
    layer = next
  }
  return layers
}
